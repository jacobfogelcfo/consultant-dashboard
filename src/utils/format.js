export const fmt = {
  currency: (amount, currency = 'USD', compact = false) => {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    const sym = currency === 'ILS' ? '₪' : '$';
    if (compact && abs >= 1000000) return `${sign}${sym}${(abs / 1000000).toFixed(1)}M`;
    if (compact && abs >= 1000) return `${sign}${sym}${(abs / 1000).toFixed(1)}k`;
    return `${sign}${sym}${abs.toLocaleString()}`;
  },
  pct: (value) => `${value >= 0 ? '+' : ''}${value}%`,
  shortMonth: (monthStr) => monthStr,
};

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
export const pctOf = (val, total) => total === 0 ? 0 : Math.round((val / total) * 100);