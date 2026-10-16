module.exports = {
  ci: {
    collect: {
      startServerCommand: 'RATE_LIMIT_MODE=memory pnpm start',
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/learn/dsa/sorting/bubble-sort',
      ],
      numberOfRuns: 3,
      settings: { chromeFlags: '--no-sandbox --disable-dev-shm-usage' },
    },
    assert: {
      assertions: Object.fromEntries(
        ['performance', 'accessibility', 'best-practices', 'seo'].map(
          (category) => [
            `categories:${category}`,
            ['error', { minScore: 0.9, aggregationMethod: 'median' }],
          ],
        ),
      ),
    },
    upload: { target: 'filesystem', outputDir: '.lighthouseci' },
  },
};
