/**
 * @fileoverview Validation and normalization for links.
 */

export const URL_PLACEHOLDER = 'https://example.com/resource';

export const URL_ERROR = 'Enter a valid link (e.g. https://example.com).';

/**
 * Normalizes a link to an absolute http(s) URL, e.g. `example.com/a` becomes
 * `https://example.com/a`. Returns null if it isn't a usable link.
 *
 * Only http and https are accepted — the link is rendered as an <a href>, so
 * schemes like `javascript:` must never survive this.
 */
export const normalizeUrl = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withScheme);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    // Reject bare hostnames like "localhost" or a stray word typed into the field.
    if (!url.hostname.includes('.')) return null;
    return url.toString();
  } catch {
    return null;
  }
};

export const isUrl = (raw: string): boolean => normalizeUrl(raw) !== null;
