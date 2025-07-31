/**
 * Date utility functions for formatting and manipulating dates
 */

/**
 * Format a date to a string with the specified format
 * @param date The date to format
 * @param format The format string (default: 'MM/dd/yyyy')
 * @returns The formatted date string
 */
export const formatDate = (date: Date, format: string = 'MM/dd/yyyy'): string => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return format
    .replace('MM', month)
    .replace('dd', day)
    .replace('yyyy', year.toString())
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * Get the start of the day for a given date
 * @param date The date
 * @returns A new Date object set to the start of the day
 */
export const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get the end of the day for a given date
 * @param date The date
 * @returns A new Date object set to the end of the day
 */
export const endOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Get the start of the month for a given date
 * @param date The date
 * @returns A new Date object set to the start of the month
 */
export const startOfMonth = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setDate(1);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get the end of the month for a given date
 * @param date The date
 * @returns A new Date object set to the end of the month
 */
export const endOfMonth = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + 1);
  newDate.setDate(0);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Get the start of the quarter for a given date
 * @param date The date
 * @returns A new Date object set to the start of the quarter
 */
export const startOfQuarter = (date: Date): Date => {
  const newDate = new Date(date);
  const month = Math.floor(newDate.getMonth() / 3) * 3;
  newDate.setMonth(month);
  newDate.setDate(1);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get the end of the quarter for a given date
 * @param date The date
 * @returns A new Date object set to the end of the quarter
 */
export const endOfQuarter = (date: Date): Date => {
  const newDate = new Date(date);
  const month = Math.floor(newDate.getMonth() / 3) * 3 + 2;
  newDate.setMonth(month);
  return endOfMonth(newDate);
};

/**
 * Get the start of the year for a given date
 * @param date The date
 * @returns A new Date object set to the start of the year
 */
export const startOfYear = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setMonth(0);
  newDate.setDate(1);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Get the end of the year for a given date
 * @param date The date
 * @returns A new Date object set to the end of the year
 */
export const endOfYear = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setMonth(11);
  newDate.setDate(31);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Add days to a date
 * @param date The date
 * @param days The number of days to add
 * @returns A new Date object with the days added
 */
export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

/**
 * Add months to a date
 * @param date The date
 * @param months The number of months to add
 * @returns A new Date object with the months added
 */
export const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

/**
 * Get the date range for a specific period
 * @param period The period type ('today', 'yesterday', 'thisWeek', 'thisMonth', 'thisQuarter', 'thisYear', 'last7Days', 'last30Days', 'last90Days', 'lastMonth', 'lastQuarter', 'lastYear')
 * @returns An object with start and end dates
 */
export const getDateRangeForPeriod = (period: string): { startDate: Date; endDate: Date } => {
  const today = new Date();
  
  switch (period) {
    case 'today':
      return { startDate: startOfDay(today), endDate: endOfDay(today) };
    case 'yesterday':
      const yesterday = addDays(today, -1);
      return { startDate: startOfDay(yesterday), endDate: endOfDay(yesterday) };
    case 'thisWeek':
      const thisWeekStart = addDays(today, -today.getDay());
      return { startDate: startOfDay(thisWeekStart), endDate: endOfDay(today) };
    case 'thisMonth':
      return { startDate: startOfMonth(today), endDate: endOfDay(today) };
    case 'thisQuarter':
      return { startDate: startOfQuarter(today), endDate: endOfDay(today) };
    case 'thisYear':
      return { startDate: startOfYear(today), endDate: endOfDay(today) };
    case 'last7Days':
      return { startDate: startOfDay(addDays(today, -6)), endDate: endOfDay(today) };
    case 'last30Days':
      return { startDate: startOfDay(addDays(today, -29)), endDate: endOfDay(today) };
    case 'last90Days':
      return { startDate: startOfDay(addDays(today, -89)), endDate: endOfDay(today) };
    case 'lastMonth':
      const lastMonth = addMonths(today, -1);
      return { startDate: startOfMonth(lastMonth), endDate: endOfMonth(lastMonth) };
    case 'lastQuarter':
      const lastQuarter = addMonths(startOfQuarter(today), -3);
      return { startDate: lastQuarter, endDate: addDays(startOfQuarter(today), -1) };
    case 'lastYear':
      const lastYear = addMonths(startOfYear(today), -12);
      return { startDate: lastYear, endDate: addDays(startOfYear(today), -1) };
    default:
      return { startDate: startOfDay(today), endDate: endOfDay(today) };
  }
};

/**
 * Format a date range as a string
 * @param startDate The start date
 * @param endDate The end date
 * @param format The date format to use
 * @returns A formatted string representing the date range
 */
export const formatDateRange = (startDate: Date, endDate: Date, format: string = 'MM/dd/yyyy'): string => {
  return `${formatDate(startDate, format)} - ${formatDate(endDate, format)}`;
};

/**
 * Check if a date is between two other dates
 * @param date The date to check
 * @param startDate The start date
 * @param endDate The end date
 * @returns True if the date is between the start and end dates (inclusive)
 */
export const isDateBetween = (date: Date, startDate: Date, endDate: Date): boolean => {
  const timestamp = date.getTime();
  return timestamp >= startDate.getTime() && timestamp <= endDate.getTime();
};

/**
 * Get the quarter number (1-4) for a given date
 * @param date The date
 * @returns The quarter number (1-4)
 */
export const getQuarter = (date: Date): number => {
  return Math.floor(date.getMonth() / 3) + 1;
};

/**
 * Get a formatted string for the quarter and year
 * @param date The date
 * @returns A string in the format "Q1 2023"
 */
export const getQuarterString = (date: Date): string => {
  return `Q${getQuarter(date)} ${date.getFullYear()}`;
};