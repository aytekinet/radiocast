// Comprehensive Turkish Podcast Detection & Strict Foreign Filtering Utility

const NON_LATIN_FOREIGN_REGEX = /[\u0600-\u06FF\u0400-\u04FF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF\u0900-\u0D7F]/;

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
  /\bel\s+p[oó]dcast\b/i
];

const TURKISH_CHARS_REGEX = /[çğışöüÇĞİŞÖÜ]/;

const TURKISH_WORDS_SET = new Set([
  've', 'bir', 'bu', 'ile', 'için', 'daha', 'en', 'kadar', 'göre', 'bölüm', 'bölümü',
  'yayın', 'yayını', 'sohbet', 'muhabbet', 'türkçe', 'turkce', 'türkiye', 'turkey',
  'nasıl', 'neden', 'hakkında', 'üzerine', 'günlük', 'haftalık', 'tarihi', 'haber',
  'haberler', 'gündem', 'bilim', 'dünya', 'dünyası', 'sanat', 'insan', 'yaşam',
  'çocuk', 'çocuklar', 'psikoloji', 'edebiyat', 'kitap', 'gece', 'masal', 'masallar',
  'sinema', 'felsefe', 'ekonomi', 'finans', 'teknoloji', 'yazılım', 'oyun', 'spor',
  'futbol', 'kulübü', 'kulüp', 'radyo', 'sesler', 'sesleri', 'sesi', 'kafası',
  'dersleri', 'notları', 'saati', 'öyküleri', 'hikayeleri', 'hikaye', 'öykü',
  'gecesi', 'rehberi', 'rehber', 'konuşmaları', 'masalları', 'masalı', 'geceleri',
  'yolculuk', 'hayat', 'fikir', 'fikirleri', 'zaman', 'kadın', 'adam', 'anne',
  'baba', 'aile', 'sağlık', 'doktor', 'hoca', 'öğretmen', 'öğrenci', 'okul',
  'tarihten', 'bugün', 'sabah', 'akşam', 'hafta', 'ay', 'yıl', 'osmanlı', 'anadolu',
  'istanbul', 'ankara', 'izmir', 'türk', 'türkü', 'türküler', 'müzik', 'şarkı',
  'kültür', 'farkındalık', 'başarı', 'motivasyon', 'gelişim', 'kariyer', 'para',
  'borsa', 'kripto', 'yatırım', 'girişim', 'girişimcilik', 'hukuk', 'adalet', 'suç',
  'cinayet', 'vaka', 'olay', 'dosya', 'belgesel', 'röportaj', 'söyleşi', 'özet',
  'kütüphane', 'yazar', 'şiir', 'roman', 'tiyatro', 'film', 'dizi', 'mizah',
  'komedi', 'eğlence', 'yapay', 'zeka', 'uygulama', 'içerik', 'yayıncılık',
  'politika', 'siyaset', 'yorum', 'analiz', 'dergi', 'gazete', 'bülten', 'rapor',
  'tıp', 'diyet', 'lig', 'takım', 'beşiktaş', 'fenerbahçe', 'galatasaray', 'trabzonspor',
  'bebek', 'ebeveyn', 'eğitim', 'gezi', 'seyahat', 'tatil', 'yemek', 'mutfak',
  'lezzet', 'kahve', 'çay', 'demode', 'socrates', 'farklı', 'kaydet', 'kaşifler',
  'aydal', 'genel', 'aposto', 'dülgeroğlu', 'terapi', 'kuzuloğlu', 'kıvrımları',
  'cabas', 'özcan', 'evrim', 'ağacı', 'entellik', 'fularsız', 'budak', 'bonomo',
  'kısa', 'dalga', 'üretim', 'bandı', 'açık', 'dinle', 'anlat', 'konuşma', 'bilişim',
  'meali', 'tasavvuf', 'serisi', 'kutusu', 'odası', 'köşesi', 'memleket', 'şehir',
  'deniz', 'doğa', 'orman', 'bahçe', 'hayvanlar', 'kedi', 'köpek', 'muhabbeti',
  'otobüs', 'araba', 'motosiklet', 'tamir', 'usta', 'şef', 'aşçı', 'gurme'
]);

const ENGLISH_FOREIGN_WORDS = new Set([
  'the', 'and', 'with', 'from', 'for', 'this', 'that', 'about', 'daily', 'weekly',
  'podcast', 'podcasts', 'show', 'episodes', 'episode', 'hosted', 'by', 'stories',
  'sleep', 'science', 'kids', 'good', 'things', 'life', 'history', 'conversations',
  'accent', 'fluency', 'radio', 'media', 'der', 'die', 'das', 'und', 'le', 'la',
  'les', 'del', 'los', 'las', 'con', 'para', 'una', 'uno', 'world', 'news'
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

  const title = (item.title || '').trim();
  const pub = (item.publisher || '').trim();
  const desc = (item.description || '').trim();
  const fullText = `${title} ${pub} ${desc}`.toLowerCase();

  if (!fullText) return false;

  // 1. Reject explicit foreign signatures
  if (isExplicitForeignText(fullText)) {
    return false;
  }

  // 2. Scan for Turkish characters
  const hasTurkishChar = TURKISH_CHARS_REGEX.test(fullText);

  // 3. Scan words
  const tokens = fullText.split(/[\s,.:;!?/"'()\[\]\-_#+]+/).filter(Boolean);
  let turkishWordHits = 0;
  let foreignWordHits = 0;

  for (const tok of tokens) {
    if (TURKISH_WORDS_SET.has(tok)) {
      turkishWordHits++;
    } else if (ENGLISH_FOREIGN_WORDS.has(tok)) {
      foreignWordHits++;
    }
  }

  // Strong negative indicator: multiple dominant foreign words and no Turkish words/chars
  if (!hasTurkishChar && turkishWordHits === 0) {
    return false;
  }

  if (foreignWordHits >= 3 && turkishWordHits === 0 && !hasTurkishChar) {
    return false;
  }

  // Must have either authentic Turkish character or verified Turkish vocabulary
  return hasTurkishChar || turkishWordHits >= 1;
}
