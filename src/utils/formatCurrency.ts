const cache = new Map<string, Intl.NumberFormat>();

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  try {
    let fmt = cache.get(currency);
    if (!fmt) {
      fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency });
      cache.set(currency, fmt);
    }
    return fmt.format(amount);
  } catch {
    // Hermes without full ICU data, or an unknown currency code.
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
};
