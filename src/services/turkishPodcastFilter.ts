// Comprehensive Turkish Podcast Detection & Strict Foreign Filtering Utility

const NON_LATIN_FOREIGN_REGEX = /[\u0600-\u06FF\u0400-\u04FF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\u0900-\u0D7F]/;

const NON_TURKISH_LANG_CODES = new Set([
  'en', 'en-us', 'en-gb', 'en-ca', 'en-au',
  'de', 'de-de', 'de-at', 'de-ch',
  'fr', 'fr-fr', 'fr-ca',
  'es', 'es-es', 'es-mx',
  'it', 'it-it',
  'ru', 'ru-ru',
  'ar', 'ar-sa',
  'zh', 'zh-cn', 'zh-tw',
  'ja', 'ja-jp',
  'ko', 'ko-kr',
  'pt', 'pt-br', 'pt-pt',
  'nl', 'nl-nl',
  'el', 'hi', 'sv', 'pl'
]);

const EXPLICIT_FOREIGN_PATTERNS: RegExp[] = [
  // Language learning (English, German, French, Spanish, Italian, Japanese, Korean etc.)
  /\blearn\s+english\b/i,
  /\bslow\s+english\b/i,
  /\beveryday\s+english\b/i,
  /\benglish\s+podcast\b/i,
  /\breal\s+english\b/i,
  /\bsimple\s+english\b/i,
  /\bculips\b/i,
  /\benglish\s+conversations?\b/i,
  /\benglish\s+fluency\b/i,
  /\benglish\s+listening\b/i,
  /\benglish\s+with\b/i,
  /\benglish\s+vocabulary\b/i,
  /\bbritish\s+accent\b/i,
  /\bamerican\s+accent\b/i,
  /\blearn\s+french\b/i,
  /\bfrançais\s+avec\b/i,
  /\bapprendre\s+le\s+français\b/i,
  /\bchoses\s+à\s+savoir\b/i,
  /\bdeutsch\s+lernen\b/i,
  /\bdeutsch-?podcast\b/i,
  /\blearn\s+german\b/i,
  /\blearn\s+spanish\b/i,
  /\bespañol\s+intermedio\b/i,
  /\bespañol\s+avanzado\b/i,
  /\blearn\s+italian\b/i,
  /\bpodcast\s+italiano\b/i,
  /\blearn\s+japanese\b/i,
  /\bnihongo\s+con\b/i,
  /\bkorean\s+for\s+beginners\b/i,
  /\bkiip\b/i,
  /\baprender\s+ingl[eé]s\b/i,

  // Religious non-Turkish / Non-Turkish names that matched "haber"
  /\brabbi\b/i,
  /\bhalacha\b/i,
  /\bmussar\b/i,
  /\bdaf\s+yomi\b/i,
  /\btiferet\b/i,
  /\bam\s+levadad\b/i,
  /\bunter\s+pfarrerstöchtern\b/i,
  /\bdie\s+zeit\b/i,

  // Spanish expressions with the verb "haber"
  /\bde\s+haber\s+sabido\b/i,
  /\bva\s+a\s+haber\b/i,
  /\bhaber\s+que\s+se\b/i,
  /\bhaber\s+tenido\b/i,
  /\bhaber\s+visto\b/i,
  /\bhaber\s+estudiao\b/i,
  /\bpudo\s+haber\b/i,
  /\bhaber\s+algo\b/i,
  /\bhaber\s+le[ií]do\b/i,
  /\ben\s+la\s+radio\b/i,
  /\ben\s+caliente\b/i,
  /\ben\s+la\s+mirilla\b/i,
  /\bnotiuno\b/i,

  // German / English names that matched "haber"
  /\bhabermehl\b/i,
  /\bhabersham\b/i,
  /\bhaberwitz\b/i,
  /\bliedhaber\b/i,
  /\bliteraturliebhaber\b/i,
  /\brechthaber\b/i,
  /\bpanzerknacker\b/i,
  /\bconnected\s+fitness\b/i,
  /\bmargie\s+haber\b/i,
  /\brobert\s+haber\b/i,
  /\bjeff\s+haber\b/i,
  /\bhaber\s+psych\b/i,

  // Major International English / Foreign media & shows
  /\bthe\s+economist\b/i,
  /\bmel\s+robbins\b/i,
  /\bmkbhd\b/i,
  /\bwaveform\b/i,
  /\bfall\s+of\s+civilizations\b/i,
  /\bmrballen\b/i,
  /\blouis\s+theroux\b/i,
  /\bwe\s+study\s+billionaires\b/i,
  /\btagesschau\b/i,
  /\bndr\b/i,
  /\bmamamia\b/i,
  /\bthe\s+why\s+files\b/i,
  /\bdr\s+sanjay\s+gupta\b/i,
  /\bhaifaa\s+younis\b/i,
  /\bimf\s+podcasts?\b/i,
  /\blocked\s+on\b/i,
  /\bcochrane\s+library\b/i,
  /\btrash\s+taste\b/i,
  /\blast\s+podcast\s+on\s+the\s+left\b/i,
  /\bsimone\s+pols\b/i,
  /\bdear\s+chelsea\b/i,
  /\bnoclip\b/i,
  /\bhigh\s+performance\b/i,
  /\bi\s+could\s+murder\s+a\s+podcast\b/i,
  /\bstuff\s+they\s+don['’]t\s+want\s+you\s+to\s+know\b/i,
  /\bjenna\s+kutcher\b/i,
  /\bgoal\s+digger\b/i,
  /\bcurbsiders\b/i,
  /\bshaun\s+attwood\b/i,
  /\bthis\s+podcast\s+will\s+kill\s+you\b/i,
  /\bthe\s+psychology\s+podcast\b/i,
  /\bthe\s+tennis\s+podcast\b/i,
  /\bthe\s+cycling\s+podcast\b/i,
  /\bthe\s+stack\s+overflow\b/i,
  /\bthe\s+levels\s+podcast\b/i,
  /\bthe\s+uncut\s+podcast\b/i,
  /\bhuberman\s+lab\b/i,
  /\bjoe\s+rogan\b/i,
  /\blex\s+fridman\b/i,
  /\bcnn\s+podcasts?\b/i,
  /\bcnn\s+5\b/i,
  /\bnpr\b/i,
  /\biheartpodcasts\b/i,
  /\bspotify\s+studios\b/i,
  /\bder\s+podcast\b/i,
  /\bde\s+podcast\b/i,
  /\bil\s+podcast\b/i,
  /\bel\s+p[oó]dcast\b/i,
  /\bmonocle\s+radio\b/i,
  /\bfinancial\s+times\b/i,
  /\bwall\s+street\s+journal\b/i,
  /\bnew\s+york\s+times\b/i
];

const TURKISH_CHARS_REGEX = /[çğışöüÇĞİŞÖÜ]/;

// Unambiguous distinct Turkish keywords (no short tokens like 'en', 've', 'in', 'so', 'de')
const DISTINCT_TURKISH_WORDS = new Set([
  'bölüm', 'bölümü', 'yayın', 'yayını', 'sohbet', 'muhabbet', 'türkçe', 'turkce',
  'türkiye', 'turkey', 'nasıl', 'neden', 'hakkında', 'üzerine', 'günlük', 'haftalık',
  'tarihi', 'gündem', 'bilim', 'dünya', 'dünyası', 'sanat', 'insan', 'yaşam',
  'çocuk', 'çocuklar', 'psikoloji', 'edebiyat', 'kitap', 'gece', 'masal', 'masallar',
  'sinema', 'felsefe', 'ekonomi', 'finans', 'teknoloji', 'yazılım', 'yazılımcı',
  'yazılımcının', 'oyun', 'kulübü', 'kulüp', 'sesler', 'sesleri', 'sesi', 'kafası',
  'dersleri', 'notları', 'saati', 'öyküleri', 'hikayeleri', 'hikaye', 'öykü',
  'gecesi', 'rehberi', 'rehber', 'konuşmaları', 'masalları', 'geceleri', 'yolculuk',
  'hayat', 'fikir', 'fikirleri', 'zaman', 'kadın', 'adam', 'anne', 'baba', 'aile',
  'sağlık', 'doktor', 'hoca', 'öğretmen', 'öğrenci', 'okul', 'tarihten', 'bugün',
  'sabah', 'akşam', 'hafta', 'osmanlı', 'anadolu', 'istanbul', 'ankara', 'izmir',
  'türk', 'türkü', 'türküler', 'şarkı', 'kültür', 'farkındalık', 'başarı', 'motivasyon',
  'gelişim', 'kariyer', 'borsa', 'kripto', 'yatırım', 'girişim', 'girişimcilik',
  'hukuk', 'adalet', 'suç', 'cinayet', 'vaka', 'belgesel', 'röportaj', 'söyleşi',
  'özet', 'kütüphane', 'yazar', 'şiir', 'roman', 'tiyatro', 'dizi', 'mizah',
  'komedi', 'eğlence', 'yapay', 'zeka', 'uygulama', 'içerik', 'yayıncılık',
  'politika', 'siyaset', 'yorum', 'analiz', 'dergi', 'gazete', 'bülten', 'rapor',
  'beşiktaş', 'fenerbahçe', 'galatasaray', 'trabzonspor', 'bebek', 'ebeveyn', 'eğitim',
  'gezi', 'seyahat', 'yemek', 'mutfak', 'lezzet', 'kahve', 'socrates', 'farklı',
  'kaydet', 'kaşifler', 'aydal', 'genel', 'aposto', 'dülgeroğlu', 'terapi', 'kuzuloğlu',
  'kıvrımları', 'cabas', 'özcan', 'evrim', 'ağacı', 'entellik', 'fularsız', 'budak',
  'bonomo', 'dalga', 'üretim', 'bandı', 'açık', 'dinle', 'anlat', 'konuşma', 'bilişim',
  'tasavvuf', 'serisi', 'memleket', 'şehir', 'deniz', 'doğa', 'orman', 'hayvanlar',
  'muhabbeti', 'tamer', 'durusu', 'kafa', 'radyo', 'trt'
]);

const ENGLISH_FOREIGN_WORDS = new Set([
  'the', 'and', 'with', 'from', 'for', 'this', 'that', 'about', 'daily', 'weekly',
  'podcast', 'podcasts', 'show', 'episodes', 'episode', 'hosted', 'by', 'stories',
  'sleep', 'science', 'kids', 'good', 'things', 'life', 'history', 'conversations',
  'accent', 'fluency', 'radio', 'media', 'der', 'die', 'das', 'und', 'le', 'la',
  'les', 'del', 'los', 'las', 'con', 'para', 'una', 'uno', 'world', 'news',
  'interview', 'interviews', 'guide', 'business', 'tech', 'entertainment'
]);

export function isExplicitForeignText(text: string): boolean {
  if (!text) return false;
  const trimmed = text.toLowerCase();

  // 1. Check non-Latin scripts (Arabic, Persian, Cyrillic, Chinese, Japanese, Korean, Devanagari)
  if (NON_LATIN_FOREIGN_REGEX.test(trimmed)) {
    return true;
  }

  // 2. Check known foreign patterns (languages, shows, networks, false positive words)
  for (const pat of EXPLICIT_FOREIGN_PATTERNS) {
    if (pat.test(trimmed)) {
      return true;
    }
  }

  return false;
}

export function isTurkishPodcastStrict(item: {
  title?: string;
  publisher?: string;
  description?: string;
  category?: string;
  language?: string;
  isCurated?: boolean;
}): boolean {
  if (!item) return false;
  if (item.isCurated) return true;

  // If explicit RSS language is declared and is a known foreign language, reject immediately
  if (item.language) {
    const lang = item.language.trim().toLowerCase().replace('_', '-');
    if (NON_TURKISH_LANG_CODES.has(lang) || (!lang.startsWith('tr') && !lang.includes('turk') && lang.length >= 2 && lang !== 'und' && lang !== 'unknown')) {
      return false;
    }
  }

  const title = (item.title || '').trim();
  const pub = (item.publisher || '').trim();
  const desc = (item.description || '').trim();
  const fullText = `${title} ${pub} ${desc}`.toLowerCase();

  if (!fullText) return false;

  // 1. Reject non-Latin scripts (Arabic, Cyrillic, Chinese, etc.)
  if (NON_LATIN_FOREIGN_REGEX.test(fullText)) {
    return false;
  }

  // 2. Reject explicit language teaching or global media shows
  if (isExplicitForeignText(fullText)) {
    return false;
  }

  // 3. If RSS declared language is explicitly Turkish (e.g. 'tr', 'tr-TR', 'turkish'):
  // Trust the metadata so Turkish tech podcasts with technical English terminology (cloud, devops, software, backend) are NOT filtered out.
  const declaredLang = (item.language || '').trim().toLowerCase().replace('_', '-');
  const isDeclaredTurkish = declaredLang.startsWith('tr') || declaredLang.includes('turk');

  if (isDeclaredTurkish) {
    // Only reject if it clearly matches an explicit foreign language show (already checked above)
    return true;
  }

  // 4. Scan for authentic Turkish characters (ç, ğ, ı, ö, ş, ü, Ç, Ğ, İ, Ö, Ş, Ü)
  const hasTurkishChar = TURKISH_CHARS_REGEX.test(fullText);

  // 5. Scan words against distinct Turkish keywords and foreign stopwords
  const tokens = fullText.split(/[\s,.:;!?/"'()\[\]\-_#+]+/).filter(Boolean);
  let turkishWordHits = 0;
  let foreignWordHits = 0;

  for (const tok of tokens) {
    if (DISTINCT_TURKISH_WORDS.has(tok)) {
      turkishWordHits++;
    }
    if (ENGLISH_FOREIGN_WORDS.has(tok)) {
      foreignWordHits++;
    }
  }

  // If authentic Turkish character is found:
  if (hasTurkishChar) {
    // Only accept if not overwhelmed by foreign words
    return foreignWordHits <= 6 || turkishWordHits >= 1;
  }

  // No Turkish characters: MUST have at least 2 distinct verified Turkish vocabulary words
  // and foreign words must not dominate
  if (turkishWordHits >= 2 && foreignWordHits <= 3) {
    return true;
  }

  return false;
}
