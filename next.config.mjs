import createNextIntlPlugin from 'next-intl/plugin';
export default createNextIntlPlugin()({
  output: 'standalone',
  outputFileTracingIncludes: {
    '/*': [
      './content/**/*',
      './node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/**/*',
    ],
  },
  poweredByHeader: false,
});
