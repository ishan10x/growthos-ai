export const formatRevenue = (v: number): string =>
  "₹" + (v / 100000).toFixed(1) + "L"
