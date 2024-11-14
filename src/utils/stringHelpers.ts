import humanizeDuration from 'humanize-duration';

const shortHumanizer = humanizeDuration.humanizer({
  language: 'short',
  languages: {
    short: {
      y: () => 'a',
      mo: () => 'me',
      w: () => 'sem',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    },
  },
});

export { shortHumanizer };
