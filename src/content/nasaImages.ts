/**
 * Real NASA pictures shown in the Training room's "why this matters" cards (D-047).
 * Each one was downloaded from NASA's public image library (images.nasa.gov) on 14 Nov 2026, resized, and is
 * bundled in public/img/nasa/ (ARCHIVED, not live). Captions restate the picture's official NASA description.
 * No picture shows a person or a NASA logo (CLAUDE.md §10).
 */
export interface NasaImage {
  file: string; // public/img/nasa/<file>.webp
  nasaId: string; // https://images.nasa.gov/details/<nasaId>
  caption: string;
  credit: string;
  published: string; // date NASA published it
  events: string[];
}

export const NASA_IMAGES: NasaImage[] = [
  {
    file: 'sunspots',
    nasaId: 'PIA26301',
    caption:
      'Dark sunspots on the Sun, photographed from Mars by the Perseverance rover in May 2024. Solar flares erupt from spots like these.',
    credit: 'NASA/JPL-Caltech/Space Science Institute',
    published: '2024-06-10',
    events: ['SW-01', 'SW-05'],
  },
  {
    file: 'storm',
    nasaId: 'PIA26302',
    caption:
      "The Curiosity rover's camera on Mars, 20 May 2024. The white specks and streaks are charged particles from a solar storm hitting the camera.",
    credit: 'NASA/JPL-Caltech',
    published: '2024-06-10',
    events: ['SW-02', 'SW-03', 'SW-04'],
  },
  {
    file: 'dusty-panel',
    nasaId: 'PIA25286',
    caption: 'A solar panel of the InSight lander on Mars, covered in dust, on 24 April 2022.',
    credit: 'NASA/JPL-Caltech',
    published: '2022-05-17',
    events: ['PW-02', 'MG-03'],
  },
  {
    file: 'dust-devil',
    nasaId: 'PIA15116',
    caption:
      'A tall dust devil (a whirlwind) on Mars and its long shadow, seen from space by the Mars Reconnaissance Orbiter.',
    credit: 'NASA/JPL-Caltech/Univ. of Arizona',
    published: '2012-03-07',
    events: ['PW-03', 'CR-04'],
  },
  {
    file: 'night',
    nasaId: 'PIA26695',
    caption:
      'A rare night picture from Mars: on 6 December 2025 the Curiosity rover lit up the ground with the lamps on its arm.',
    credit: 'NASA/JPL-Caltech/MSSS',
    published: '2026-01-27',
    events: ['PW-07', 'CR-02'],
  },
  {
    file: 'crystals',
    nasaId: 'PIA26727',
    caption:
      'Yellow sulfur crystals inside a Mars rock. Curiosity drove over the rock and cracked it open in 2024.',
    credit: 'NASA/JPL-Caltech/MSSS',
    published: '2026-06-30',
    events: ['RS-01', 'RS-03'],
  },
  {
    file: 'ice',
    nasaId: 'PIA10906',
    caption:
      'Ice in a trench dug by the Phoenix lander on Mars in 2008. Over four days some of the ice turned straight into vapour.',
    credit: 'NASA/JPL-Caltech/University of Arizona/Texas A&M University',
    published: '2008-06-20',
    events: ['LS-05'],
  },
  {
    file: 'moxie',
    nasaId: 'PIA24203',
    caption:
      'MOXIE, a gold box inside the Perseverance rover. It made oxygen from the carbon dioxide in Mars air.',
    credit: 'NASA/JPL-Caltech',
    published: '2021-01-19',
    events: ['LS-03', 'LS-01'],
  },
  {
    file: 'veggie',
    nasaId: 'KSC-20171017-PH_ISS01_0001',
    caption:
      'Lettuce and mustard plants growing in the Veggie garden on the International Space Station in 2017.',
    credit: 'NASA',
    published: '2017-10-17',
    events: ['FD-06'],
  },
];

export const imageFor = (eventId: string): NasaImage | undefined =>
  NASA_IMAGES.find((i) => i.events.includes(eventId));
