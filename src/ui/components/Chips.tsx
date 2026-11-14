/** Cost / effect / later / risk chips. Never colour alone: each chip has a sign or a word and an icon. */
import type { Chip as ChipT } from '../../engine/types';
import { chipLabel, signed, ui, fill } from '../text';
import { Icon, type UiIcon } from './Icon';

/** D-043: oxygen tanks, spare parts, med kits and crew air are not part of the kid game's screen. */
const HIDDEN = new Set(['O2T', 'PARTS', 'MEDKIT', 'AIR']);
/** D-044: power is the battery (its own icon); the bolt means crew energy only. Food and water are one bar each. */
const ICON: Record<string, UiIcon> = { PWR: 'BAT', FUL: 'FOOD', HYD: 'H2O' };
const iconOf = (c: ChipT): UiIcon => ICON[c.icon] ?? c.icon;

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
        <Icon name={iconOf(c)} size={15} />
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
      <Icon name={iconOf(c)} size={16} />
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
  chips = chips.filter((c) => !HIDDEN.has(c.icon));
  if (!chips.length) return null;
  return (
    <div class="chip-row">
      {chips.map((c, i) => (
        <Chip key={i} c={c} {...(risk ? { risk } : {})} {...(compact ? { compact } : {})} />
      ))}
    </div>
  );
}
