/**
 * Turkish Character Normalization and Intelligent Search Utilities
 * Handles all Turkish letter variations:
 * ı <-> i, İ <-> i, ş <-> s, ğ <-> g, ö <-> o, ü <-> u, ç <-> c
 */

export function normalizeTurkishText(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if target string matches query under Turkish rules
 */
export function turkishIncludes(target: string, query: string): boolean {
  if (!target || !query) return false;
  const normTarget = normalizeTurkishText(target);
  const normQuery = normalizeTurkishText(query);
  if (!normQuery) return true;
  return normTarget.includes(normQuery) || target.toLowerCase().includes(query.toLowerCase());
}

/**
 * Calculates match score for ranking:
 * 100 = Exact match
 * 80 = Starts with
 * 60 = Word in target starts with query
 * 40 = Substring match
 * 0 = No match
 */
export function turkishMatchScore(target: string, query: string): number {
  if (!target || !query) return 0;
  const normTarget = normalizeTurkishText(target);
  const normQuery = normalizeTurkishText(query);
  if (!normQuery) return 0;

  if (normTarget === normQuery) return 100;
  if (normTarget.startsWith(normQuery)) return 80;

  const words = normTarget.split(' ');
  for (const w of words) {
    if (w.startsWith(normQuery)) return 60;
  }

  if (normTarget.includes(normQuery)) return 40;
  return 0;
}
