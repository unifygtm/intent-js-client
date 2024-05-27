module.exports = {
  plugins: [require('@trivago/prettier-plugin-sort-imports')],
  singleQuote: true,
  trailingComma: 'all',
  importOrder: [
    '^browser/(.*)$',
    '^client/(.*)$',
    '^tests/(.*)$',
    '^types',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
};
