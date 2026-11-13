/**
 * All kid-facing UI strings live here (CLAUDE.md §9), so a translation is possible later.
 * The game ships in English (lead, 13 Nov).
 */
export const copy = {
  gameName: 'Mars Base Adventure',
  tagline: 'Junior Astronaut Mission Trainer',
  hello: 'Hello, Mission Leader!', // N-01 (default)
  intro: 'Keep 4 astronauts safe on Mars. Every choice costs something.',
  play: 'Play',
  playSoon: 'Coming soon: the first mission is being built.',
  dataSources: 'Where our data comes from',
  settings: 'Settings',
  back: 'Back',
  footer:
    'Fan-made educational game. Not affiliated with or endorsed by NASA. Uses public NASA data.',
  meters: {
    LS: 'Life support',
    SH: 'Shield',
    PWR: 'Power',
    SP: 'Science stars',
    DOSE: 'Radiation badge',
  },
  sources: {
    title: 'Where our data comes from',
    intro:
      'Every true fact in this game has a source number like [S6]. Here is the full list. Grown-ups can open each link to check it.',
    placeholder: 'More about how the game uses real NASA data is coming soon.',
    specVersion: (v: string) => `Game rules version ${v}.`,
    credits: 'Credits',
    creditLines: [
      'Icons: Twemoji by Twitter, Inc. and other contributors, CC-BY 4.0 (github.com/jdecked/twemoji).',
      'Font: Atkinson Hyperlegible by the Braille Institute of America, SIL Open Font License 1.1.',
      'Made by Team Nova Knights for the NASA Space Apps Challenge 2026 (Cairo).',
    ],
  },
  settingsScreen: {
    title: 'Settings',
    projector: 'Projector mode (bigger text)',
    projectorHint: 'For showing the game to a whole class.',
    placeholder: 'More settings are coming soon.',
  },
} as const;
