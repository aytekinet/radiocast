import { isTurkishPodcastStrict, isExplicitForeignText } from '../../services/turkishPodcastFilter';

export function normalizeLanguageCode(lang?: string): string {
  if (!lang) return '';
  return lang.trim().toLowerCase().replace('_', '-');
}

export function isTurkishLanguageCode(lang?: string): boolean {
  const norm = normalizeLanguageCode(lang);
  return norm.startsWith('tr');
}

export function calculateTurkishConfidence(item: {
  language?: string;
  country?: string;
  title?: string;
  description?: string;
  publisher?: string;
  isCurated?: boolean;
}): number {
  if (item.isCurated) return 1.0;

  const fullText = `${item.title || ''} ${item.publisher || ''} ${item.description || ''}`.trim();
  if (!fullText) return 0;

  if (isExplicitForeignText(fullText)) {
    return 0.0;
  }

  const isStrictTurkish = isTurkishPodcastStrict(item);
  if (!isStrictTurkish) {
    return 0.0;
  }

  return 1.0;
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
  return isTurkishPodcastStrict(item);
}

