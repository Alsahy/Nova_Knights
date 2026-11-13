/** Greenhouse (spec FD-01, §2.6, D-013, D-014). Night step 5. */
import { CROPS, RES_HARVEST_BONUS, UNTENDED_CROP_DELAY } from './config';
import { greenhouseRunning } from './power';
import { log } from './state';
import type { Content, GameState } from './types';

export function growCrops(s: GameState, content: Content): void {
  const c = s.crop;
  if (!c) return;
  if (!greenhouseRunning(s)) {
    c.readySol += 1; // paused today (unplugged / room closed)
    log(s, 'harvest', 'log.cropPaused', { crop: c.kind });
    return;
  }
  if (s.sol < c.readySol) return;
  if (!c.tended && !c.delayedUntended) {
    c.readySol += UNTENDED_CROP_DELAY; // D-013
    c.delayedUntended = true;
    log(s, 'harvest', 'log.cropUntended', { crop: c.kind });
    return;
  }
  const bonus = c.tendedByRes ? RES_HARVEST_BONUS : 0;
  if (c.kind === 'pepper') {
    // FD-05 decides what happens to the peppers (spec FD-05; D-014 automatic pollination in Cadet).
    if (content.missions[s.mission]?.events.includes('FD-05') ?? true) {
      s.queue.push({ eventId: 'FD-05', dueSol: s.sol + 1, sinceSol: s.sol + 1, source: 'harvest' });
      if (bonus) s.supplies.FOOD += bonus;
    } else {
      // D-018/D-025: no Taco Night in the kid scope → the harvest is food (FD-01.b FOOD+8).
      const food = CROPS.pepper.food + bonus;
      s.supplies.FOOD += food;
      log(s, 'harvest', 'log.harvest', { crop: c.kind, food });
    }
  } else {
    const food = CROPS[c.kind].food + bonus;
    s.supplies.FOOD += food;
    log(s, 'harvest', 'log.harvest', { crop: c.kind, food });
  }
  s.crop = null; // FD-01 re-planting comes as tomorrow's Morning Briefing (D-004)
}
