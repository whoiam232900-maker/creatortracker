/**
 * Deterministic date formatting to avoid hydration mismatches.
 * Uses YYYY-MM-DD HH:mm format.
 */
export function formatDeterministic(date: Date | string | null | undefined, includeTime = false): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  const base = `${year}-${month}-${day}`;
  
  if (includeTime) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${base} ${hours}:${minutes}`;
  }
  
  return base;
}
