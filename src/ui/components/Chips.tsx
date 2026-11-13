/** Cost / effect / later / risk chips. Never colour alone: each chip has a sign or a word and an icon. */
import type { Chip as ChipT } from '../../engine/types';
import { chipLabel, signed, ui, fill } from '../text';
import { Icon } from './Icon';

export function Chip({ c, risk, compact }: { c: ChipT; risk?: string; compact?: boolean }) {
  const label = chipLabel(c);
  if (compact) {
    const short = c.amount !== undefined ? '' : c.icon === 'DOSE' ? ui.outside : label;
    return (
      <span
        class={`chip chip-${c.tone} chip-compact`}
        title={label}
        aria-label={`${c.amount !== undefined ? signed(c.amount) + ' ' : ''}${label}`}
      >
        <Icon name={c.icon} size={15} />
        {c.amount !== undefined && <b class="chip-amt">{signed(c.amount)}</b>}
        {short && <span aria-hidden="true">{short}</span>}
      </span>
    );
  }
  const when = c.inSols
    ? ` · ${fill('in {n} sol' + (c.inSols > 1 ? 's' : ''), { n: c.inSols })}`
    : '';
  return (
    <span class={`chip chip-${c.tone}`}>
      <Icon name={c.icon} size={16} />
      {c.amount !== undefined && <b class="chip-amt">{signed(c.amount)}</b>}
      <span>
        {c.tone === 'risk' && risk ? `${ui.risk} (${risk}): ` : ''}
        {label}
        {when}
      </span>
    </span>
  );
}

export function ChipRow({
  chips,
  risk,
  compact,
}: {
  chips: ChipT[];
  risk?: string;
  compact?: boolean;
}) {
  if (!chips.length) return null;
  return (
    <div class="chip-row">
      {chips.map((c, i) => (
        <Chip key={i} c={c} {...(risk ? { risk } : {})} {...(compact ? { compact } : {})} />
      ))}
    </div>
  );
}
