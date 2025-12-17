/**
 * Locale-aware Formatters
 * Format dates, numbers, currencies, and relative times based on user's locale
 */

/**
 * Format a date according to user's locale
 *
 * @example
 * formatDate(new Date(), 'en') // "December 16, 2025"
 * formatDate(new Date(), 'es') // "16 de diciembre de 2025"
 * formatDate(new Date(), 'ar') // "١٦ ديسمبر ٢٠٢٥"
 */
export function formatDate(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, options ?? defaultOptions).format(date);
}

/**
 * Format a short date
 *
 * @example
 * formatShortDate(new Date(), 'en') // "12/16/2025"
 * formatShortDate(new Date(), 'de') // "16.12.2025"
 */
export function formatShortDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date);
}

/**
 * Format a time according to user's locale
 *
 * @example
 * formatTime(new Date(), 'en') // "3:30 PM"
 * formatTime(new Date(), 'de') // "15:30"
 */
export function formatTime(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, options ?? defaultOptions).format(date);
}

/**
 * Format date and time together
 */
export function formatDateTime(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}

/**
 * Format a number according to user's locale
 *
 * @example
 * formatNumber(1234567, 'en') // "1,234,567"
 * formatNumber(1234567, 'de') // "1.234.567"
 * formatNumber(1234567, 'ar') // "١٬٢٣٤٬٥٦٧"
 */
export function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format a number with specific decimal places
 */
export function formatDecimal(
  value: number,
  locale: string,
  decimals: number = 2
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a percentage according to user's locale
 *
 * @example
 * formatPercent(0.85, 'en') // "85%"
 * formatPercent(0.85, 'ar') // "٨٥٪"
 */
export function formatPercent(
  value: number,
  locale: string,
  decimals: number = 0
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format currency according to user's locale
 *
 * @example
 * formatCurrency(9.99, 'en', 'USD') // "$9.99"
 * formatCurrency(9.99, 'de', 'EUR') // "9,99 €"
 */
export function formatCurrency(
  value: number,
  locale: string,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format compact number (abbreviation)
 *
 * @example
 * formatCompactNumber(1500, 'en') // "1.5K"
 * formatCompactNumber(1500000, 'en') // "1.5M"
 */
export function formatCompactNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 *
 * @example
 * formatRelativeTime(new Date(Date.now() - 3600000), 'en') // "1 hour ago"
 * formatRelativeTime(new Date(Date.now() + 86400000 * 3), 'en') // "in 3 days"
 */
export function formatRelativeTime(date: Date, locale: string): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffWeek = Math.round(diffDay / 7);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffYear) >= 1) return rtf.format(diffYear, 'year');
  if (Math.abs(diffMonth) >= 1) return rtf.format(diffMonth, 'month');
  if (Math.abs(diffWeek) >= 1) return rtf.format(diffWeek, 'week');
  if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, 'day');
  if (Math.abs(diffHour) >= 1) return rtf.format(diffHour, 'hour');
  if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, 'minute');
  return rtf.format(diffSec, 'second');
}

/**
 * Format duration in minutes/hours
 *
 * @example
 * formatDuration(90, 'en') // "1 hr 30 min"
 * formatDuration(45, 'en') // "45 min"
 */
export function formatDuration(minutes: number, locale: string): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Format ordinal number
 *
 * @example
 * formatOrdinal(1, 'en') // "1st"
 * formatOrdinal(2, 'en') // "2nd"
 */
export function formatOrdinal(value: number, locale: string): string {
  const pr = new Intl.PluralRules(locale, { type: 'ordinal' });
  const suffixes: Record<string, string> = {
    one: 'st',
    two: 'nd',
    few: 'rd',
    other: 'th',
  };

  const rule = pr.select(value);
  const suffix = suffixes[rule] || suffixes.other;

  return `${value}${suffix}`;
}

/**
 * Format list of items
 *
 * @example
 * formatList(['Apple', 'Banana', 'Orange'], 'en') // "Apple, Banana, and Orange"
 * formatList(['Apple', 'Banana', 'Orange'], 'es') // "Apple, Banana y Orange"
 */
export function formatList(
  items: string[],
  locale: string,
  type: 'conjunction' | 'disjunction' = 'conjunction'
): string {
  return new Intl.ListFormat(locale, {
    style: 'long',
    type,
  }).format(items);
}
