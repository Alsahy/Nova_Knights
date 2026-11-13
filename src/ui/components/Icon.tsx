/**
 * SVG icon subset (Twemoji, CC-BY 4.0) instead of system emoji (N-06): older Android shows 🫁 as a box.
 * Icons are decorative (alt=""): every icon is shown next to a text label, never alone.
 */
export type IconKey = 'LS' | 'SH' | 'PWR' | 'SP' | 'DOSE';

const FILES: Record<IconKey, string> = { LS: 'ls', SH: 'sh', PWR: 'pwr', SP: 'sp', DOSE: 'dose' };

export function Icon({ name, size = 28 }: { name: IconKey; size?: number }) {
  return (
    <img
      class="icon"
      src={`${import.meta.env.BASE_URL}icons/${FILES[name]}.svg`}
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
    />
  );
}
