import type { WebotEnvelope } from './types';

const DEFAULT_BASE_URL = 'https://api.webot.com';
const DEFAULT_MIN_INTERVAL_MS = 110;
const DEFAULT_RATE_LIMIT_BAN_MS = 60_000;

export type WebotQueryValue = string | number | boolean | undefined;

export interface WebotHttpClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  now?: () => number;
  sleep?: (milliseconds: number) => Promise<void>;
  minIntervalMs?: number;
  rateLimitBanMs?: number;
}

export interface WebotResponse<T> {
  data: T;
  serverTime: number;
  receivedAt: number;
}

export class WebotHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'WebotHttpError';
    this.status = status;
  }
}

export class WebotRateLimitError extends WebotHttpError {
  readonly retryAfterMs: number;

  constructor(retryAfterMs: number) {
    super(429, `Webot rate limit exceeded; requests blocked for ${retryAfterMs} ms`);
    this.name = 'WebotRateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

export class WebotApiError extends Error {
  readonly code: string;
  readonly serverTime: number;

  constructor(code: string, message: string, serverTime: number) {
    super(message);
    this.name = 'WebotApiError';
    this.code = code;
    this.serverTime = serverTime;
  }
}

export class WebotProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebotProtocolError';
  }
}

const defaultSleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseEnvelope<T>(value: unknown): WebotEnvelope<T> {
  if (!isRecord(value)) {
    throw new WebotProtocolError('Webot response was not an object');
  }

  if (typeof value.result !== 'boolean') {
    throw new WebotProtocolError('Webot response is missing boolean result');
  }

  if (typeof value.timestamp !== 'number' || !Number.isFinite(value.timestamp)) {
    throw new WebotProtocolError('Webot response is missing a finite timestamp');
  }

  return value as unknown as WebotEnvelope<T>;
}

export class WebotHttpClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;
  private readonly sleep: (milliseconds: number) => Promise<void>;
  private readonly minIntervalMs: number;
  private readonly rateLimitBanMs: number;
  private nextRequestAt = 0;
  private blockedUntil = 0;
  private reservationChain: Promise<void> = Promise.resolve();

  constructor(options: WebotHttpClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.now = options.now ?? Date.now;
    this.sleep = options.sleep ?? defaultSleep;
    this.minIntervalMs = options.minIntervalMs ?? DEFAULT_MIN_INTERVAL_MS;
    this.rateLimitBanMs = options.rateLimitBanMs ?? DEFAULT_RATE_LIMIT_BAN_MS;
  }

  async get<T>(
    path: string,
    query: Readonly<Record<string, WebotQueryValue>> = {},
  ): Promise<WebotResponse<T>> {
    await this.reserveRequestSlot();

    const url = new URL(path, `${this.baseUrl}/`);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await this.fetchImpl(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    const receivedAt = this.now();

    if (response.status === 429) {
      this.blockedUntil = Math.max(this.blockedUntil, receivedAt + this.rateLimitBanMs);
      throw new WebotRateLimitError(this.rateLimitBanMs);
    }

    if (!response.ok) {
      throw new WebotHttpError(response.status, `Webot HTTP ${response.status}`);
    }

    const envelope = parseEnvelope<T>(await response.json());

    if (!envelope.result) {
      const code = typeof envelope.code === 'string' ? envelope.code : 'UNKNOWN_WEBOT_ERROR';
      const message =
        typeof envelope.message === 'string' ? envelope.message : 'Webot API returned result=false';
      throw new WebotApiError(code, message, envelope.timestamp);
    }

    if (envelope.data === undefined) {
      throw new WebotProtocolError('Successful Webot response is missing data');
    }

    return {
      data: envelope.data,
      serverTime: envelope.timestamp,
      receivedAt,
    };
  }

  private async reserveRequestSlot(): Promise<void> {
    const reservation = this.reservationChain.then(async () => {
      const currentTime = this.now();
      const eligibleAt = Math.max(this.nextRequestAt, this.blockedUntil);
      const waitMs = eligibleAt - currentTime;

      if (waitMs > 0) {
        await this.sleep(waitMs);
      }

      const reservedAt = this.now();
      this.nextRequestAt = Math.max(reservedAt, eligibleAt) + this.minIntervalMs;
    });

    this.reservationChain = reservation.catch(() => undefined);
    await reservation;
  }
}
