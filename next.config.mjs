import createNextIntlPlugin from 'next-intl/plugin';
export default createNextIntlPlugin()({
  output: 'standalone',
  outputFileTracingIncludes: { '/learn/**/*': ['./content/**/*'] },
  poweredByHeader: false,
});
