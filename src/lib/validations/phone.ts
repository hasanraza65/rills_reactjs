/**
 * @fileoverview Validation and normalization for Pakistani mobile numbers.
 */

/** Masked sample shown in inputs — 11 digits, mobile prefix, no real number. */
export const PK_MOBILE_PLACEHOLDER = '0300XXXXXXX';

export const PK_MOBILE_ERROR =
  'Enter a valid 11-digit mobile number (e.g. 0300XXXXXXX or +92300XXXXXXX).';

/** Separators people type but that carry no meaning. */
const stripSeparators = (raw: string) => raw.replace(/[\s\-().]/g, '');

/**
 * Normalizes a Pakistani mobile number to its international form, e.g.
 * `0301 4242 701` and `+92 301 4242 701` both become `+923014242701`.
 *
 * Accepts only the local 11-digit form (03xxxxxxxxx) and the 12-digit
 * international form (92xxxxxxxxxx, with or without a leading +). Anything
 * shorter, longer, or not on a mobile prefix (03xx) returns null.
 */
export const normalizePkMobile = (raw: string): string | null => {
  const digits = stripSeparators(raw).replace(/^\+/, '');

  let subscriber: string | null = null;
  if (/^0\d{10}$/.test(digits)) subscriber = digits.slice(1);
  else if (/^92\d{10}$/.test(digits)) subscriber = digits.slice(2);

  // Every Pakistani mobile prefix starts with 3; this rejects landlines.
  if (!subscriber || !/^3\d{9}$/.test(subscriber)) return null;

  return `+92${subscriber}`;
};

export const isPkMobile = (raw: string): boolean => normalizePkMobile(raw) !== null;
