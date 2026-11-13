/** Kid-level "True story" lines from the kids guide, by event ID, each carrying its event's [S#] (N-03 default). */
import spec from './generated/spec.json';

export interface Story {
  id: string;
  title: string;
  happens: string;
  trueStory: string;
  sources: string[];
}

const details = spec.details as Record<string, { realScience: { sources: string[] } }>;

export const STORIES: Record<string, Story> = Object.fromEntries(
  spec.guide.stories.map((s) => [
    s.id,
    { ...s, sources: details[s.id]?.realScience.sources ?? [] },
  ]),
);
