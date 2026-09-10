/**
 * Transient feedback (F-17). Preserves the reference's single shared message and
 * its 2600ms dismissal; adds an aria-live region so the announcement reaches
 * assistive technology, which the reference never did.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_MS = 2600;

export interface ToastApi {
  message: string | null;
  show: (message: string) => void;
}

export function useToast(): ToastApi {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((next: string) => {
    setMessage(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), TOAST_MS);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return { message, show };
}
