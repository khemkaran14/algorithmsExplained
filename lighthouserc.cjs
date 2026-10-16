module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm start',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/learn/dsa/sorting/bubble-sort',
      ],
      numberOfRuns: 1,
      settings: { chromeFlags: '--no-sandbox --disable-dev-shm-usage' },
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci' },
  },
};
