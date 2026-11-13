/** Science words get a tap-to-explain tooltip (spec §1.1 rule 5). Keyboard: Tab to it, Enter to open. */
import { useState } from 'preact/hooks';
import { markTerms } from '../../content/glossary';

function TermButton({ shown, meaning }: { shown: string; meaning: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span class="term-wrap">
      <button type="button" class="term" aria-expanded={open} onClick={() => setOpen(!open)}>
        {shown}
      </button>
      {open && (
        <span class="term-pop" role="note">
          <b>{shown}:</b> {meaning}
        </span>
      )}
    </span>
  );
}

export function GlossaryText({ text }: { text: string }) {
  return (
    <>
      {markTerms(text).map((p, i) =>
        typeof p === 'string' ? p : <TermButton key={i} shown={p.shown} meaning={p.meaning} />,
      )}
    </>
  );
}
