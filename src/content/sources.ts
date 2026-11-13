/** Sources [S#] for the "Where our data comes from" screen, generated from spec §11. */
import spec from './generated/spec.json';

export interface Source {
  id: string;
  title: string;
  url: string;
  urls: string[];
}

export const SPEC_VERSION: string = spec.specVersion;
export const SOURCES: Source[] = spec.sources;

export function sourceById(id: string): Source | undefined {
  return SOURCES.find((s) => s.id === id);
}
