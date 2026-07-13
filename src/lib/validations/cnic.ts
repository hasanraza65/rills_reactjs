/**
 * @fileoverview Validation and normalization for Pakistani CNIC numbers.
 */

/** Masked sample shown in inputs — 13 digits, no real CNIC. */
export const CNIC_PLACEHOLDER = '35201-XXXXXXX-X';

export const CNIC_ERROR = 'Enter a valid 13-digit CNIC (e.g. 35201-XXXXXXX-X).';

/**
 * Normalizes a CNIC to its dashed form, e.g. both `3520112345671` and
 * `35201-1234567-1` become `35201-1234567-1`.
 *
 * A CNIC is exactly 13 digits (5 area, 7 serial, 1 check). Anything shorter,
 * longer, or non-numeric returns null.
 */
export const normalizeCnic = (raw: string): string | null => {
  const digits = raw.replace(/[\s-]/g, '');
  if (!/^\d{13}$/.test(digits)) return null;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

export const isCnic = (raw: string): boolean => normalizeCnic(raw) !== null;
