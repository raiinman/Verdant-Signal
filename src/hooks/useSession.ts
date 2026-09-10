/**
 * Session: Telegram binding + entitlement.
 *
 * Boot precedence and storage keys are ported from the reference, including its
 * VIP-before-free ordering, which makes combination 5 in STATE_MATRIX.md §1
 * (VIP restored without a bound handle) genuinely reachable.
 *
 * Key names are namespaced vs_* rather than the reference's ag_*, since this is
 * a different origin and inheriting another app's storage would be incorrect.
 */

import { useCallback, useState } from 'react';
import type { BindingState, Entitlement, Session } from '../types/telemetry';

const LS_TG_USER = 'vs_tg_user';
const LS_FREE = 'vs_free_unlocked';
const LS_VIP_TOKEN = 'vs_vip_token';
const LS_VIP_HANDLE = 'vs_vip_handle';

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* blocked storage is not fatal — the session simply does not persist */
  }
}

function clearAll(): void {
  try {
    [LS_TG_USER, LS_FREE, LS_VIP_TOKEN, LS_VIP_HANDLE].forEach((k) =>
      localStorage.removeItem(k),
    );
  } catch {
    /* nothing to clear */
  }
}

/** Reference boot order: bound user → VIP token → free unlock → guest. */
function bootSession(): Session {
  const tgUser = read(LS_TG_USER);
  const vipToken = read(LS_VIP_TOKEN);
  const vipHandle = read(LS_VIP_HANDLE);
  const freeHandle = read(LS_FREE);

  if (tgUser) {
    const handle = freeHandle ?? vipHandle ?? '';
    return {
      binding: 'CONNECTED',
      entitlement: vipToken ? 'VIP' : 'FREE_UNLOCKED',
      handle,
    };
  }
  if (vipToken || vipHandle) {
    return { binding: 'DISCONNECTED', entitlement: 'VIP', handle: vipHandle ?? 'VIP Member' };
  }
  if (freeHandle) {
    return { binding: 'DISCONNECTED', entitlement: 'FREE_UNLOCKED', handle: freeHandle };
  }
  return { binding: 'DISCONNECTED', entitlement: 'GUEST', handle: '' };
}

/** Reference normalisation: a handle always carries a leading '@'. */
export function normaliseHandle(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

export interface SessionApi {
  session: Session;
  isUnlockedFree: boolean;
  isVip: boolean;
  setBinding: (state: BindingState) => void;
  /** Binds a handle and unlocks the two free slots (F-06). */
  connect: (handle: string) => void;
  /** Grants VIP after confirmed deposit (F-12). */
  grantVip: (handle?: string) => void;
  /** Clears all four keys and re-masks every slot (F-08). */
  disconnect: () => void;
}

export function useSession(): SessionApi {
  const [session, setSession] = useState<Session>(bootSession);

  const connect = useCallback((raw: string) => {
    const handle = normaliseHandle(raw);
    write(LS_TG_USER, JSON.stringify({ handle }));
    write(LS_FREE, handle);
    setSession((prev) => ({
      binding: 'CONNECTED',
      entitlement: prev.entitlement === 'VIP' ? 'VIP' : 'FREE_UNLOCKED',
      handle,
    }));
  }, []);

  const grantVip = useCallback((handle?: string) => {
    setSession((prev) => {
      const next = handle ? normaliseHandle(handle) : prev.handle;
      write(LS_VIP_TOKEN, 'ACTIVE');
      if (next) write(LS_VIP_HANDLE, next);
      return { ...prev, entitlement: 'VIP', handle: next };
    });
  }, []);

  const disconnect = useCallback(() => {
    clearAll();
    setSession({ binding: 'DISCONNECTED', entitlement: 'GUEST', handle: '' });
  }, []);

  const setBinding = useCallback((binding: BindingState) => {
    setSession((prev) => ({ ...prev, binding }));
  }, []);

  return {
    session,
    isUnlockedFree: session.entitlement !== 'GUEST',
    isVip: session.entitlement === 'VIP',
    setBinding,
    connect,
    grantVip,
    disconnect,
  };
}

export type { Entitlement };
