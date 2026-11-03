export type AppLocale = 'tr' | 'en' | 'ru';

export interface TranslationDictionary {
  appName: string;
  discover: string;
  radios: string;
  podcasts: string;
  favorites: string;
  history: string;
  settings: string;
  bigScreen: string;
  searchPlaceholder: string;
  all: string;
  live: string;
  play: string;
  pause: string;
  stop: string;
  previous: string;
  next: string;
  connecting: string;
  reconnecting: string;
  reconnectingAttempt: string;
  error: string;
  offline: string;
  sleepTimer: string;
  sleepTimerActive: string;
  sleepTimerFadeOut: string;
  minutes: string;
  cancel: string;
  start: string;
  add15Min: string;
  popularRadios: string;
  popularPodcasts: string;
  worldRadios: string;
  categories: string;
  genres: string;
  countries: string;
  languages: string;
  recentlyPlayed: string;
  clearHistory: string;
  clearHistoryConfirm: string;
  resumePlaying: string;
  speed: string;
  forward30: string;
  rewind15: string;
  follow: string;
  following: string;
  episodes: string;
  addRss: string;
  rssPlaceholder: string;
  addRssSuccess: string;
  addRssError: string;
  noResults: string;
  tryAgain: string;
  cleanFilters: string;
  volume: string;
  theme: string;
  themeDark: string;
  themeLight: string;
  themeSystem: string;
  language: string;
  resetData: string;
  resetConfirm: string;
  copiedToClipboard: string;
  share: string;
  escapeToExit: string;
  customGroups: string;
  createGroup: string;
  groupNamePlaceholder: string;
  deleteGroup: string;
  stationDetail: string;
  podcastDetail: string;
}

export const TRANSLATIONS: Record<AppLocale, TranslationDictionary> = {
  tr: {
    appName: 'RadioCast',
    discover: 'Keşfet',
    radios: 'Radyolar',
    podcasts: 'Podcastler',
    favorites: 'Favoriler',
    history: 'Geçmiş',
    settings: 'Ayarlar',
    bigScreen: 'Büyük Ekran',
    searchPlaceholder: 'İstasyon, podcast veya tür ara...',
    all: 'Tümü',
    live: 'CANLI',
    play: 'Oynat',
    pause: 'Duraklat',
    stop: 'Durdur',
    previous: 'Önceki',
    next: 'Sonraki',
    connecting: 'Bağlanılıyor...',
    reconnecting: 'Yeniden bağlanılıyor...',
    reconnectingAttempt: 'Yeniden bağlanılıyor ({attempt}/{max}) - {sec}s',
    error: 'Yayın açılamıyor',
    offline: 'Çevrimdışısınız',
    sleepTimer: 'Uyku Zamanlayıcısı',
    sleepTimerActive: 'Zamanlayıcı Aktif',
    sleepTimerFadeOut: 'Yayın 30 saniye içinde kısılarak kapanacak',
    minutes: 'dakika',
    cancel: 'İptal',
    start: 'Başlat',
    add15Min: '+15 dk',
    popularRadios: 'Popüler Radyolar',
    popularPodcasts: 'Popüler Podcastler',
    worldRadios: 'Dünya Radyoları',
    categories: 'Kategoriler',
    genres: 'Türler',
    countries: 'Ülkeler',
    languages: 'Diller',
    recentlyPlayed: 'Son Dinlenenler',
    clearHistory: 'Geçmişi Temizle',
    clearHistoryConfirm: 'Dinleme geçmişinizi temizlemek istediğinize emin misiniz? (Favorileriniz korunur)',
    resumePlaying: 'Kaldığın Yerden Devam Et',
    speed: 'Hız',
    forward30: '30 sn İleri',
    rewind15: '15 sn Geri',
    follow: 'Takip Et',
    following: 'Takip Ediliyor',
    episodes: 'Bölümler',
    addRss: 'RSS ile Podcast Ekle',
    rssPlaceholder: 'https://ornek.com/podcast-feed.xml',
    addRssSuccess: 'Podcast başarıyla kütüphanenize eklendi!',
    addRssError: 'Geçerli bir RSS XML beslemesi bulunamadı.',
    noResults: 'Aramanızla eşleşen sonuç bulunamadı.',
    tryAgain: 'Tekrar Dene',
    cleanFilters: 'Filtreleri Temizle',
    volume: 'Ses Seviyesi',
    theme: 'Görünüm Teması',
    themeDark: 'Koyu Tema (Slate)',
    themeLight: 'Açık Tema',
    themeSystem: 'Sistem Teması',
    language: 'Arayüz Dili',
    resetData: 'Tüm Verileri Sıfırla',
    resetConfirm: 'Tüm favoriler, dinleme geçmişi ve ayarlar sıfırlanacaktır. Emin misiniz?',
    copiedToClipboard: 'Bağlantı panoya kopyalandı!',
    share: 'Paylaş',
    escapeToExit: 'Çıkmak için Esc tuşuna basın',
    customGroups: 'Özel Radyo Grupları',
    createGroup: 'Yeni Grup Oluştur',
    groupNamePlaceholder: 'Grup adı (örn. Gece Müzikleri)',
    deleteGroup: 'Grubu Sil',
    stationDetail: 'İstasyon Ayrıntıları',
    podcastDetail: 'Podcast Ayrıntıları'
  },
  en: {
    appName: 'RadioCast',
    discover: 'Discover',
    radios: 'Radio',
    podcasts: 'Podcasts',
    favorites: 'Favorites',
    history: 'History',
    settings: 'Settings',
    bigScreen: 'Big Screen',
    searchPlaceholder: 'Search station, podcast or genre...',
    all: 'All',
    live: 'LIVE',
    play: 'Play',
    pause: 'Pause',
    stop: 'Stop',
    previous: 'Previous',
    next: 'Next',
    connecting: 'Connecting...',
    reconnecting: 'Reconnecting...',
    reconnectingAttempt: 'Reconnecting ({attempt}/{max}) - {sec}s',
    error: 'Stream unavailable',
    offline: 'You are offline',
    sleepTimer: 'Sleep Timer',
    sleepTimerActive: 'Sleep Timer Active',
    sleepTimerFadeOut: 'Stream fading out in 30 seconds',
    minutes: 'minutes',
    cancel: 'Cancel',
    start: 'Start',
    add15Min: '+15 min',
    popularRadios: 'Popular Radios',
    popularPodcasts: 'Popular Podcasts',
    worldRadios: 'World Radio',
    categories: 'Categories',
    genres: 'Genres',
    countries: 'Countries',
    languages: 'Languages',
    recentlyPlayed: 'Recently Played',
    clearHistory: 'Clear History',
    clearHistoryConfirm: 'Are you sure you want to clear listening history? (Favorites are preserved)',
    resumePlaying: 'Resume Playback',
    speed: 'Speed',
    forward30: '30s Forward',
    rewind15: '15s Back',
    follow: 'Follow',
    following: 'Following',
    episodes: 'Episodes',
    addRss: 'Add Podcast via RSS',
    rssPlaceholder: 'https://example.com/podcast-feed.xml',
    addRssSuccess: 'Podcast successfully added to library!',
    addRssError: 'Valid RSS XML feed not found.',
    noResults: 'No results found matching your search.',
    tryAgain: 'Try Again',
    cleanFilters: 'Clear Filters',
    volume: 'Volume',
    theme: 'Appearance Theme',
    themeDark: 'Dark Theme (Slate)',
    themeLight: 'Light Theme',
    themeSystem: 'System Theme',
    language: 'Language',
    resetData: 'Reset All Data',
    resetConfirm: 'All favorites, history and settings will be reset. Are you sure?',
    copiedToClipboard: 'Link copied to clipboard!',
    share: 'Share',
    escapeToExit: 'Press Esc to exit full screen',
    customGroups: 'Custom Radio Groups',
    createGroup: 'Create New Group',
    groupNamePlaceholder: 'Group name (e.g. Night Jazz)',
    deleteGroup: 'Delete Group',
    stationDetail: 'Station Details',
    podcastDetail: 'Podcast Details'
  },
  ru: {
    appName: 'RadioCast',
    discover: 'Обзор',
    radios: 'Радио',
    podcasts: 'Подкасты',
    favorites: 'Избранное',
    history: 'История',
    settings: 'Настройки',
    bigScreen: 'Большой Экран',
    searchPlaceholder: 'Поиск станции, подкаста или жанра...',
    all: 'Все',
    live: 'В ЭФИРЕ',
    play: 'Слушать',
    pause: 'Пауза',
    stop: 'Стоп',
    previous: 'Предыдущий',
    next: 'Следующий',
    connecting: 'Подключение...',
    reconnecting: 'Переподключение...',
    reconnectingAttempt: 'Переподключение ({attempt}/{max}) - {sec}с',
    error: 'Поток недоступен',
    offline: 'Нет подключения к интернету',
    sleepTimer: 'Таймер сна',
    sleepTimerActive: 'Таймер активен',
    sleepTimerFadeOut: 'Плавное затухание звука за 30 секунд',
    minutes: 'минут',
    cancel: 'Отмена',
    start: 'Запустить',
    add15Min: '+15 мин',
    popularRadios: 'Популярные Радиостанции',
    popularPodcasts: 'Популярные Подкасты',
    worldRadios: 'Мировое Радио',
    categories: 'Категории',
    genres: 'Жанры',
    countries: 'Страны',
    languages: 'Языки',
    recentlyPlayed: 'Недавно прослушано',
    clearHistory: 'Очистить историю',
    clearHistoryConfirm: 'Вы уверены, что хотите очистить историю? (Избранное сохранится)',
    resumePlaying: 'Продолжить воспроизведение',
    speed: 'Скорость',
    forward30: '30 сек вперед',
    rewind15: '15 сек назад',
    follow: 'Подписаться',
    following: 'Вы подписаны',
    episodes: 'Выпуски',
    addRss: 'Добавить подкаст по RSS',
    rssPlaceholder: 'https://example.com/podcast-feed.xml',
    addRssSuccess: 'Подкаст успешно добавлен в библиотеку!',
    addRssError: 'Действительный фид RSS XML не найден.',
    noResults: 'По вашему запросу ничего не найдено.',
    tryAgain: 'Попробовать снова',
    cleanFilters: 'Сбросить фильтры',
    volume: 'Громкость',
    theme: 'Тема оформления',
    themeDark: 'Темная тема (Slate)',
    themeLight: 'Светлая тема',
    themeSystem: 'Системная тема',
    language: 'Язык интерфейса',
    resetData: 'Сбросить все данные',
    resetConfirm: 'Все закладки, история и настройки будут сброшены. Вы уверены?',
    copiedToClipboard: 'Ссылка скопирована в буфер обмена!',
    share: 'Поделиться',
    escapeToExit: 'Нажмите Esc для выхода',
    customGroups: 'Группы радиостанций',
    createGroup: 'Создать группу',
    groupNamePlaceholder: 'Название группы (напр. Ночной джаз)',
    deleteGroup: 'Удалить группу',
    stationDetail: 'Информация о радиостанции',
    podcastDetail: 'Информация о подкасте'
  }
};

export function getTranslation(key: keyof TranslationDictionary, locale: AppLocale = 'tr'): string {
  const dict = TRANSLATIONS[locale] || TRANSLATIONS.tr;
  return dict[key] || TRANSLATIONS.tr[key] || String(key);
}

export function formatReconnectText(attempt: number, max: number, seconds: number, locale: AppLocale = 'tr'): string {
  const raw = getTranslation('reconnectingAttempt', locale);
  return raw
    .replace('{attempt}', String(attempt))
    .replace('{max}', String(max))
    .replace('{sec}', String(seconds));
}
