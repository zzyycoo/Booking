/**
 * Date formatting utilities
 */

/**
 * Format date as DD-Mmm-YYYY
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day.toString().padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;
}

/**
 * Format date as ordinal-Mmm (e.g., 1st-Jan)
 */
export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDate();
  const ordinal = day + (day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${ordinal}-${months[date.getMonth()]}`;
}

/**
 * Get today's date string (YYYY-MM-DD)
 */
export function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Get tomorrow's date string (YYYY-MM-DD)
 */
export function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Resolve PID display logic
 * - Has new ID → use new ID
 * - Only old ID → use old ID
 * - Neither → return 'New'
 */
export function resolvePID(oldPID, newPID) {
  const old = (oldPID || '').trim();
  const nw = (newPID || '').trim();
  const newIsReal = nw && nw.toLowerCase() !== 'new';
  const oldIsReal = old && old.toLowerCase() !== 'new';
  if (newIsReal) return nw;
  if (oldIsReal) return old;
  return 'New';
}
