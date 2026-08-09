export function normalizeLanguageCode(lang?: string): string {
  if (!lang) return '';
  return lang.trim().toLowerCase().replace('_', '-');
}

export function isTurkishLanguageCode(lang?: string): boolean {
  const norm = normalizeLanguageCode(lang);
  return norm.startsWith('tr');
}

const TURKISH_CHARS_REGEX = /[çğışöüÇĞİŞÖÜ]/;
const TURKISH_KEYWORDS = [
  've', 'bir', 'için', 'ile', 'bu', 'daha', 'en', 'de', 'da', 'ki', 'olan',
  'olarak', 'sonra', 'kadar', 'göre', 'sonra', 'yeni', 'gibi', 'çok', 'her',
  'türkçe', 'turkce', 'türkiye', 'turkey', 'sohbet', 'felsefe', 'haber',
  'gündem', 'tarih', 'psikoloji', 'bilim', 'teknoloji', 'mizah', 'ekonomi',
  'spor', 'sanat', 'edebiyat', 'muhabbet', 'bölüm', 'yayın', 'yayıncı', 'kulübü'
];

export function calculateTurkishConfidence(item: {
  language?: string;
  country?: string;
  title?: string;
  description?: string;
  publisher?: string;
  isCurated?: boolean;
}): number {
  if (item.isCurated) return 1.0;

  const title = (item.title || '').trim();
  const desc = (item.description || '').trim();
  const pub = (item.publisher || '').trim();
  const textToScan = `${title} ${desc} ${pub}`.toLowerCase();

  if (!textToScan) return 0;

  // 1. Explicit Turkish characters in title/description/publisher -> Strongest indicator
  const hasTurkishChars = TURKISH_CHARS_REGEX.test(textToScan);

  // 2. Count Turkish keywords
  const words = textToScan.split(/\s+/).map(w => w.replace(/[^a-zA-ZçğışöüÇĞİŞÖÜ]/g, ''));
  let matchedKeywords = 0;
  for (const w of words) {
    if (TURKISH_KEYWORDS.includes(w)) {
      matchedKeywords++;
      if (matchedKeywords >= 5) break;
    }
  }

  // 3. Detect dominant English text (e.g. BBC, TED, NPR, Global News)
  const englishStopWords = ['the', 'and', 'with', 'from', 'this', 'that', 'about', 'daily', 'weekly', 'official', 'podcast', 'episodes', 'hosted', 'by'];
  let englishMatches = 0;
  for (const w of words) {
    if (englishStopWords.includes(w)) {
      englishMatches++;
      if (englishMatches >= 3) break;
    }
  }

  // If text has 0 Turkish chars, 0 Turkish keywords, and multiple English stop words -> It's non-Turkish
  if (!hasTurkishChars && matchedKeywords === 0 && englishMatches >= 2) {
    return 0.0;
  }

  let score = 0;

  if (hasTurkishChars) {
    score += 0.5;
  }

  if (matchedKeywords >= 1) score += 0.2;
  if (matchedKeywords >= 2) score += 0.2;
  if (matchedKeywords >= 4) score += 0.2;

  // Only trust language code if not contradicted by text
  if (isTurkishLanguageCode(item.language) && item.language !== 'tr-unknown') {
    score += 0.2;
  }

  if (item.country === 'TR' || item.country === 'tr' || item.country === 'TUR') {
    score += 0.1;
  }

  return Math.min(1.0, score);
}

export function isTurkishPodcast(item: {
  language?: string;
  country?: string;
  title?: string;
  description?: string;
  publisher?: string;
  isCurated?: boolean;
}): boolean {
  if (item.isCurated) return true;
  return calculateTurkishConfidence(item) >= 0.5;
}
