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

  let score = 0;

  if (isTurkishLanguageCode(item.language)) {
    score += 0.8;
  }

  const textToScan = `${item.title || ''} ${item.description || ''} ${item.publisher || ''}`.toLowerCase();

  if (TURKISH_CHARS_REGEX.test(textToScan)) {
    score += 0.4;
  }

  const words = textToScan.split(/\s+/);
  let matchedKeywords = 0;
  for (const w of words) {
    const cleanW = w.replace(/[^a-zA-ZçğışöüÇĞİŞÖÜ]/g, '');
    if (TURKISH_KEYWORDS.includes(cleanW)) {
      matchedKeywords++;
      if (matchedKeywords >= 3) break;
    }
  }

  if (matchedKeywords >= 1) score += 0.2;
  if (matchedKeywords >= 3) score += 0.3;

  if (item.country === 'TR' || item.country === 'tr') {
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
  return calculateTurkishConfidence(item) >= 0.4;
}
