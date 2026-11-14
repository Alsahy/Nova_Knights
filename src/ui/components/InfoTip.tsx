import { createPortal } from 'preact/compat';
import { useRef, useState } from 'preact/hooks';

/**
 * A small "?" that opens grown-up / science text on hover, focus or tap (D-029).
 * The pop-up is drawn at the top level of the page, right next to the mouse pointer (or under the button
 * for keyboard and touch), so no panel can clip or shift it and it always stays fully on screen.
 */
export function InfoTip({
  label,
  children,
}: {
  label: string;
  children: preact.ComponentChildren;
}) {
  const [at, setAt] = useState<Record<string, string> | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const openAt = (x: number, y: number) => {
    const w = Math.min(340, window.innerWidth - 16);
    const left = Math.max(8, Math.min(window.innerWidth - w - 8, x + 14));
    const below = y < window.innerHeight * 0.6;
    setAt({
      width: `${w}px`,
      left: `${left}px`,
      ...(below ? { top: `${y + 16}px` } : { bottom: `${window.innerHeight - y + 12}px` }),
    });
  };
  const openAtButton = () => {
    const r = btn.current?.getBoundingClientRect();
    if (r) openAt(r.left - 14, r.bottom - 8);
  };
  const close = () => setAt(null);
  return (
    <span class="info-wrap" onMouseEnter={(e) => openAt(e.clientX, e.clientY)} onMouseLeave={close}>
      <button
        ref={btn}
        type="button"
        class="info-btn"
        aria-label={label}
        aria-expanded={at !== null}
        onClick={(e) => {
          e.stopPropagation();
          if (at) close();
          else openAtButton();
        }}
        onFocus={() => !at && openAtButton()}
        onBlur={close}
      >
        ?
      </button>
      {at &&
        createPortal(
          <span class="info-pop fixed" role="note" style={at}>
            {children}
          </span>,
          document.body,
        )}
    </span>
  );
}
