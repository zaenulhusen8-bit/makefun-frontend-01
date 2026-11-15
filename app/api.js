const API = 'https://make.fun/api';
const cache = new Map();

/**
 * Fetch JSON from the API, using an in‑memory cache keyed by path.
 * The cache stores the ETag so subsequent requests can use `If‑None‑Match`.
 * @param {string} path - API endpoint path, e.g. '/items'.
 * @returns {Promise<any>} The parsed JSON data.
 */
export async function getJSON(path) {
  const url = `${API}${path}`;
  const headers = { Accept: 'application/json' };
  const entry = cache.get(path);
  if (entry) headers['If-None-Match'] = entry.etag;
  const res = await fetch(url, { headers });
  if (res.status === 304) {
    return entry.data;
  }
  if (res.status === 200) {
    const data = await res.json();
    const etag = res.headers.get('etag');
    cache.set(path, { data, etag });
    return data;
  }
  throw new Error(`HTTP ${res.status}`);
}

/**
 * Format a number as US dollars with two decimal places.
 * @param {number} n
 * @returns {string}
 */
export function money(n) {
  return '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/**
 * Calculate remaining time until a deadline ISO string.
 * @param {string} deadlineISO
 * @returns {string}
 */
export function timeLeft(deadlineISO) {
  const now = Date.now();
  const due = Date.parse(deadlineISO);
  const diff = due - now;
  if (diff <= 0) return 'closed';
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  const remainingMins = mins % 60;
  if (days > 0) return `${days}d ${remainingHours}h`;
  if (hours > 0) return `${hours}h ${remainingMins}m`;
  return `${remainingMins}m`;
}

/**
 * Determine if a contest object is still open based on its deadline.
 * @param {{deadline: string}} c
 * @returns {boolean}
 */
export function isOpen(c) {
  return Date.now() < Date.parse(c.deadline);
}

