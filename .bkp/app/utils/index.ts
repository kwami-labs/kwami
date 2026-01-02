export function logg (content: any, title = 'log'): void {
  console.log(title, content);
}

export function genHash (n: number) {
  const chars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < n; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function sleep (ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function convertBoolean <T> (value: T): boolean | T {
  if (typeof value === 'string' && (value === 'true' || value === 'false')) {
    return value === 'true';
  }
  return value;
}

export function convertObjBooleans <T> (obj: any): T {
  for (const key in obj) {
    if (typeof obj[key] === 'string' &&
    (obj[key] === 'true' || obj[key] === 'false')) {
      obj[key] = convertBoolean(obj[key]);
    }
  }
  return obj;
}

export function isDeepEqual (
  obj1: any, obj2: any, avoid: string[] = []): boolean {
  if (obj1 === obj2) {
    return true;
  }
  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 == null ||
    obj2 == null
  ) {
    return false;
  }
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (const key of keys1) {
    if (avoid.includes(key)) {
      continue;
    }
    if (!keys2.includes(key) || !isDeepEqual(obj1[key], obj2[key], avoid)) {
      return false;
    }
  }
  return true;
}

export function deepClone <T> (obj: T): T | null {
  return safeParseJSON<T>(JSON.stringify(obj));
}

export function isObject (object: any) {
  return object != null && typeof object === 'object';
}

export function isUndefined (value: any): boolean {
  return typeof value === 'undefined';
}

export function isRequired (input: string): boolean {
  return input.trimEnd().endsWith('*');
}

export function highestAvailableId (arr: any[], id = 'id'): number {
  try {
    const ids = arr.map(x => x[id]);
    let i = 1;
    while (ids.includes(i)) {
      i++;
    }
    return i;
  } catch (err) {
    return -1;
  }
}

export function lowestAvailableId (arr: any[], id = 'id'): number {
  try {
    const ids = arr.map(x => x[id]);
    let i = arr.length + 1;
    while (ids.includes(i)) {
      i--;
    }
    return i;
  } catch (err) {
    return -1;
  }
}

export function safeParseJSON <T> (jsonString: any): T | null {
  if (isObject(jsonString)) {
    return jsonString;
  }
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    return null;
  }
}

export function getElementLabelForNonInputElements (
  sortNum: number,
  showSortNum?: boolean
): string {
  return showSortNum ? `[${sortNum}]` : '';
}

export function stringifyDate (date: Date, separator = '-'): string {
  if (!date) { return ''; }
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}${separator}${month}${separator}${year}`;
}

export function resetObjectInPlace (obj: any, initialState: any): void {
  for (const key in obj) {
    if (Object.hasOwn(initialState, key)) {
      obj[key] = initialState[key];
    } else {
      delete obj[key];
    }
  }
  for (const key in initialState) {
    if (!(key in obj)) {
      obj[key] = initialState[key];
    }
  }
}

export function findRowById<T extends { id: string }> (
  rows: T[], id: string): T | undefined {
  if (!id) { return; }
  return rows.find(row => row.id === id);
}

export function findRowByElementId<T extends { formElementId: string }> (
  rows: T[], id: string): T | undefined {
  if (!id) { return; }
  return rows.find(row => row.formElementId === id);
}

export function findRowBySortNum<T extends { sortNum: number }> (
  rows: T[], sortNum: number): T | undefined {
  return rows.find(row => row.sortNum === sortNum);
}

export function sortRowsBySortNum<T extends { sortNum: number }> (
  rows: T[], sortOrder: 'asc' | 'desc' = 'asc'
) {
  return rows.sort((a, b) =>
    sortOrder === 'asc' ? a.sortNum - b.sortNum : b.sortNum - a.sortNum
  );
}

export function isValidDate (d: any): boolean {
  if (d instanceof Date) {
    return !isNaN(d.getTime());
  } else if (d && typeof d === 'object' && 'start' in d && 'end' in d) {
    return isValidDate(d.start) && isValidDate(d.end);
  }
  return false;
}

export function getRandomInt (max: number): number {
  return Math.floor(Math.random() * max);
}

export function cleanURL (url: string): string {
  return url.trim().replaceAll(/([^:]\/)\/+/g, '$1');
}

export function concatDate (
  y: string, m: string, d: string, separator = '-'): string {
  if (!y || !m || !d) { return ''; }
  return `${y}${separator}${m}${separator}${d}`;
}

export function splitDate (
  date: string, separator = '-'
): { year: string, month: string, day: string } {
  try {
    const [year, month, day] = date.split(separator);
    return { year, month, day };
  } catch (err) {
    return { year: '', month: '', day: '' };
  }
}

export function stringToDate (dateString: string): Date {
  return new Date(dateString);
}

export function dateToString (date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const formattedMonth = month < 10 ? `0${month}` : month.toString();
  const formattedDay = day < 10 ? `0${day}` : day.toString();
  return `${year}-${formattedMonth}-${formattedDay}`;
}

export function formatDatetime (date: string | undefined): string {
  if (!date) { return ''; }
  return date.replace('T', ' ').replace('Z', '').split('.')[0];
}

export function timeDifference (date1: string, date2: string): string {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  let diffInSeconds = Math.abs((d2.getTime() - d1.getTime()) / 1000);
  const hours = Math.floor(diffInSeconds / 3600);
  diffInSeconds %= 3600;
  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = Math.floor(diffInSeconds % 60);
  let result = '';
  if (hours > 0) {
    result += `${hours} hour${hours > 1 ? 's' : ''} `;
  }
  if (minutes > 0) {
    result += `${minutes} min `;
  }
  result += `${seconds} sec`;
  return result.trim();
}

export function ensureDigits (num: string, digits: number): string {
  return num.padStart(digits, '0');
}

export function formatDate (date: string, separator = '-'): string {
  const { year, month, day } = splitDate(date);
  if (!year || !month || !day) { return date; }
  const yyyy = year.length === 2 ? `20${year}` : year;
  const mm = ensureDigits(month, 2);
  const dd = ensureDigits(day, 2);
  return `${yyyy}${separator}${mm}${separator}${dd}`;
}

export function truncateString (str: string, maxLen: number): string {
  if (!str || str.length <= maxLen || typeof str !== 'string') {
    return str;
  }
  const words = str.split(' ');
  let truncated = '';
  let index = 0;
  while (index < words.length &&
    (truncated.length + words[index].length + (index ? 1 : 0)) <= maxLen) {
    truncated += (index ? ' ' : '') + words[index];
    index++;
  }
  if (truncated.length < str.length) {
    truncated += '...';
  }
  return truncated;
}

export function cleanIcon (icon: string): string {
  return icon.toLowerCase() === 'none' ? '' : icon;
}

export function getNestedValue<T> (obj: T, keyPath: string): any {
  return keyPath.split('.').reduce((acc, key) => {
    return acc && (acc as Record<string, any>)[key];
  }, obj);
}

export function genericSort<T> (
  array: T[], keyPath?: string, order: 'asc' | 'desc' = 'asc'
): T[] | null {
  try {
    if (!Array.isArray(array)) {
      throw new TypeError('Input is not an array.');
    }
    if (array.length === 0) {
      return array;
    }
    const compare = (a: any, b: any) => {
      if (a < b) { return -1; }
      if (a > b) { return 1; }
      return 0;
    };
    const sortOrder = order === 'asc' ? 1 : -1;
    const firstElement = array[0];
    if (typeof firstElement === 'number' || typeof firstElement === 'string') {
      return array.sort((a, b) => compare(a, b) * sortOrder);
    }
    if (typeof firstElement === 'object' && keyPath) {
      return array.sort((a, b) => {
        const aValue = getNestedValue(a, keyPath);
        const bValue = getNestedValue(b, keyPath);
        return compare(aValue, bValue) * sortOrder;
      });
    }
    if (typeof firstElement === 'object' && !keyPath) {
      throw new Error('No key path provided for sorting complex array.');
    }
    throw new Error('Unsupported array element type.');
  } catch (err) {
    return null;
  }
}

export function multiKeySort<T> (
  array: T[], keys: string[], order: 'asc' | 'desc' = 'asc'
): T[] | null {
  try {
    if (!Array.isArray(array)) {
      throw new TypeError('Input is not an array.');
    }
    if (array.length === 0) {
      return array;
    }
    const compare = (a: any, b: any) => {
      if (a < b) { return -1; }
      if (a > b) { return 1; }
      return 0;
    };
    const sortOrder = order === 'asc' ? 1 : -1;
    return array.sort((a, b) => {
      for (const key of keys) {
        const aValue = getNestedValue(a, key);
        const bValue = getNestedValue(b, key);
        const result = compare(aValue, bValue);
        if (result !== 0) {
          return result * sortOrder;
        }
      }
      return 0;
    });
  } catch (err) {
    return null;
  }
}

export function convertUTCToLocalISO (utcDate: string | Date): string {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  if (isNaN(date.getTime())) {
    throw new TypeError('Invalid date provided');
  }
  return date.toISOString();
}

export function convertISOToLocal (isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    throw new TypeError('Invalid ISO date string provided');
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function convertUTCToLocal (utcDate: string | Date): string {
  const isString = convertUTCToLocalISO(utcDate);
  return convertISOToLocal(isString);
}
