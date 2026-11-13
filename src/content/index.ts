/**
 * Runtime content (lane S): the generated content.json (built from the spec by scripts/build-content.ts)
 * + the missions. Nothing is parsed in the browser.
 */
import data from './generated/content.json';
import { MISSIONS } from './missions';
import type { Content } from '../engine/types';

export { MVP_EVENTS } from './mvp';

export const CONTENT: Content = {
  specVersion: data.specVersion,
  events: data.events as unknown as Content['events'],
  tasks: data.tasks as unknown as Content['tasks'],
  missions: MISSIONS,
};
