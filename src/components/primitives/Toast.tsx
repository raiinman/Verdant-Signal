/**
 * Transient feedback region (F-17). One shared message, as in the reference,
 * but announced politely to assistive technology.
 */

import './Toast.css';

export function Toast({ message }: { message: string | null }) {
  return (
    <div className="vs-toast" role="status" aria-live="polite" data-visible={message !== null}>
      {message !== null && <span className="vs-toast__body vs-data">{message}</span>}
    </div>
  );
}
