/**
 * Utility functions for formatting values
 */

/**
 * Format a number as currency
 * @param value The number to format
 * @param currency The currency code (default: 'USD')
 * @param locale The locale to use for formatting (default: 'en-US')
 * @returns The formatted currency string
 */
export const formatCurrency = (value: number, currency: string = 'USD', locale: string = 'en-US'): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format a number with thousand separators
 * @param value The number to format
 * @param decimalPlaces The number of decimal places (default: 0)
 * @param locale The locale to use for formatting (default: 'en-US')
 * @returns The formatted number string
 */
export const formatNumber = (value: number, decimalPlaces: number = 0, locale: string = 'en-US'): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
};

/**
 * Format a number as a percentage
 * @param value The number to format (e.g., 0.25 for 25%)
 * @param decimalPlaces The number of decimal places (default: 1)
 * @param locale The locale to use for formatting (default: 'en-US')
 * @returns The formatted percentage string
 */
export const formatPercent = (value: number, decimalPlaces: number = 1, locale: string = 'en-US'): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
};

/**
 * Format a number with a specific unit
 * @param value The number to format
 * @param unit The unit to append (e.g., 'kg', 'MB')
 * @param decimalPlaces The number of decimal places (default: 1)
 * @param locale The locale to use for formatting (default: 'en-US')
 * @returns The formatted number with unit
 */
export const formatWithUnit = (value: number, unit: string, decimalPlaces: number = 1, locale: string = 'en-US'): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);

  return `${formattedNumber} ${unit}`;
};

/**
 * Format a large number with abbreviations (K, M, B, T)
 * @param value The number to format
 * @param decimalPlaces The number of decimal places (default: 1)
 * @param locale The locale to use for formatting (default: 'en-US')
 * @returns The formatted abbreviated number
 */
export const formatCompactNumber = (value: number, decimalPlaces: number = 1, locale: string = 'en-US'): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  // For values less than 1000, just use regular formatting
  if (Math.abs(value) < 1000) {
    return formatNumber(value, decimalPlaces, locale);
  }

  const abbreviations = ['', 'K', 'M', 'B', 'T'];
  const tier = Math.floor(Math.log10(Math.abs(value)) / 3);
  const suffix = abbreviations[tier];
  const scale = Math.pow(10, tier * 3);
  const scaledValue = value / scale;

  return `${formatNumber(scaledValue, decimalPlaces, locale)}${suffix}`;
};

/**
 * Format a number as accounting notation (negative numbers in parentheses)
 * @param value The number to format
 * @param decimalPlaces The number of decimal places (default: 2)
 * @param locale The locale to use for formatting (default: 'en-US')
 * @returns The formatted accounting notation
 */
export const formatAccounting = (value: number, decimalPlaces: number = 2, locale: string = 'en-US'): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  const formattedNumber = formatNumber(Math.abs(value), decimalPlaces, locale);
  return value < 0 ? `(${formattedNumber})` : formattedNumber;
};

/**
 * Format a currency value as accounting notation (negative numbers in parentheses)
 * @param value The number to format
 * @param currency The currency code (default: 'USD')
 * @param locale The locale to use for formatting (default: 'en-US')
 * @returns The formatted accounting currency notation
 */
export const formatCurrencyAccounting = (value: number, currency: string = 'USD', locale: string = 'en-US'): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedNumber = formatter.format(Math.abs(value));
  return value < 0 ? `(${formattedNumber})` : formattedNumber;
};

/**
 * Format a number with a plus or minus sign
 * @param value The number to format
 * @param decimalPlaces The number of decimal places (default: 1)
 * @param locale The locale to use for formatting (default: 'en-US')
 * @returns The formatted number with sign
 */
export const formatWithSign = (value: number, decimalPlaces: number = 1, locale: string = 'en-US'): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  const formattedNumber = formatNumber(Math.abs(value), decimalPlaces, locale);
  return value >= 0 ? `+${formattedNumber}` : `-${formattedNumber}`;
};

/**
 * Format a percentage with a plus or minus sign
 * @param value The number to format (e.g., 0.25 for 25%)
 * @param decimalPlaces The number of decimal places (default: 1)
 * @param locale The locale to use for formatting (default: 'en-US')
 * @returns The formatted percentage with sign
 */
export const formatPercentWithSign = (value: number, decimalPlaces: number = 1, locale: string = 'en-US'): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-';
  }

  const formattedPercent = formatPercent(Math.abs(value), decimalPlaces, locale);
  return value >= 0 ? `+${formattedPercent}` : `-${formattedPercent}`;
};