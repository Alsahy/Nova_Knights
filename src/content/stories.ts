/** Kid-level "True story" lines from the kids guide, by event ID, each carrying its event's [S#] (N-03 default). */
import data from './generated/content.json';

export interface Story {
  id: string;
  title: string;
  happens: string;
  trueStory: string;
  sources: string[];
}

export const STORIES: Record<string, Story> = Object.fromEntries(
  data.stories.map((s) => [s.id, s]),
);
