import createNextIntlPlugin from 'next-intl/plugin';
export default createNextIntlPlugin()({
  output: 'standalone',
  poweredByHeader: false,
});
