/** Cost / effect / later / risk chips. Never colour alone: each chip has a sign or a word and an icon. */
import type { Chip as ChipT } from '../../engine/types';
import { chipLabel, signed, ui, fill } from '../text';
import { Icon } from './Icon';

export function Chip({ c, risk }: { c: ChipT; risk?: string }) {
  const label = chipLabel(c);
  const when = c.inSols ? ` · ${fill('in {n} sol' + (c.inSols > 1 ? 's' : ''), { n: c.inSols })}` : '';
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

export function ChipRow({ chips, risk }: { chips: ChipT[]; risk?: string }) {
  if (!chips.length) return null;
  return (
    <div class="chip-row">
      {chips.map((c, i) => (
        <Chip key={i} c={c} {...(risk ? { risk } : {})} />
      ))}
    </div>
  );
}
