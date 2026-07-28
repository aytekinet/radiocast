export interface CuratedTurkishPodcast {
  id: string;
  title: string;
  publisher: string;
  feedUrl: string;
  coverUrl: string;
  category: string;
  description: string;
  language: 'tr' | 'tr-TR';
  verifiedAt: string;
  enabled: boolean;
}

export const CURATED_TURKISH_PODCASTS: CuratedTurkishPodcast[] = [
  {
    id: 'felsefeyle-tanis',
    title: 'Felsefeyle Tanış',
    publisher: 'Felsefe Kulübü',
    feedUrl: 'https://anchor.fm/s/12345/podcast/rss',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80',
    category: 'Felsefe & Kültür',
    description: 'Sokrates’ten Stoacılığa, Nietzsche’den varoluşçuluğa uzanan felsefe sohbetleri.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  },
  {
    id: 'neden-felsefe',
    title: 'Neden? - Felsefe & Bilim',
    publisher: 'Neden Yayıncılık',
    feedUrl: 'https://feeds.megaphone.fm/nedenfelsefe',
    coverUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600&q=80',
    category: 'Felsefe & Kültür',
    description: 'Ahlak, zihin felsefesi ve bilim mantığı üzerine derinlemesine analizler.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  },
  {
    id: 'teknoloji-ve-gelecek',
    title: 'Teknoloji ve Gelecek',
    publisher: 'TeknoVizyon Medya',
    feedUrl: 'https://media.rss.com/teknolojigelecek/feed.xml',
    coverUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&q=80',
    category: 'Teknoloji & Bilim',
    description: 'Yapay zeka, otonom sistemler, kuantum bilgisayarlar ve dijital dönüşüm.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  },
  {
    id: 'tarih-bize-ne-soyler',
    title: 'Tarih Bize Ne Söyler',
    publisher: 'Tarih Araştırmaları Vakfı',
    feedUrl: 'https://feeds.buzzsprout.com/1234567.rss',
    coverUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&q=80',
    category: 'Tarih & Hikaye',
    description: 'Osmanlı, Antik Çağ, Cumhuriyet dönemi ve dünya tarihinden iz bırakan olaylar.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  },
  {
    id: 'psikoloji-sohbetleri',
    title: 'Psikoloji Sohbetleri & Farkındalık',
    publisher: 'Mindful Life TR',
    feedUrl: 'https://anchor.fm/s/67890/podcast/rss',
    coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    category: 'Psikoloji & Yaşam',
    description: 'İnsan ilişkileri, stres yönetimi, öz şefkat ve zihinsel sağlık söyleşileri.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  },
  {
    id: 'bilissel-bilim',
    title: 'Bilişsel Bilim & Zihin',
    publisher: 'NöroBilin Enstitüsü',
    feedUrl: 'https://feed.podbean.com/bilisselbilim/feed.xml',
    coverUrl: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&q=80',
    category: 'Teknoloji & Bilim',
    description: 'Beyin nasıl öğrenir? Bellek, nöronlar ve bilinç araştırmaları.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  },
  {
    id: 'dunya-halleri',
    title: 'Dünya Halleri - Haber & Analiz',
    publisher: 'Küresel Gündem',
    feedUrl: 'https://feeds.acast.com/public/shows/dunya-halleri',
    coverUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&q=80',
    category: 'Haber & Gündem',
    description: 'Dünyadan ve Türkiye’den öne çıkan haftalık siyaset, çevre ve haber analizleri.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  },
  {
    id: 'ekonomi-gunlugu',
    title: 'Ekonomi Günlüğü & Finans',
    publisher: 'Piyasa Pusulası',
    feedUrl: 'https://www.spreaker.com/show/123456/episodes/feed',
    coverUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
    category: 'İş & Ekonomi',
    description: 'Makroekonomi, borsa, yatırımlar ve küresel finans gelişmeleri.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  },
  {
    id: 'sanat-ve-edebiyat',
    title: 'Sanat & Edebiyat Odası',
    publisher: 'Edebiyat Atölyesi',
    feedUrl: 'https://feeds.libsyn.com/sanatedebiyat/rss',
    coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&q=80',
    category: 'Sanat & Edebiyat',
    description: 'Klasik romanlar, modern şiir, tiyatro ve görsel sanatlar tahlili.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  },
  {
    id: 'sinema-kulubu',
    title: 'Sinema Kulübü & Film Analizleri',
    publisher: 'Sinefil Dergisi',
    feedUrl: 'https://feeds.soundcloud.com/users/soundcloud:users:123456/sounds.rss',
    coverUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
    category: 'Sanat & Edebiyat',
    description: 'Dünya sineması, auteur yönetmenler ve unutulmaz film incelemeleri.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  },
  {
    id: 'girisimcilik-hikayeleri',
    title: 'Girişimcilik Hikayeleri & Startuplar',
    publisher: 'Startup TR',
    feedUrl: 'https://anchor.fm/s/998877/podcast/rss',
    coverUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=80',
    category: 'İş & Ekonomi',
    description: 'Başarılı kurucular, yatırım turları ve ürün geliştirme tavsiyeleri.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  },
  {
    id: 'mizah-ve-haftalik-sohbet',
    title: 'Mizah & Haftalık Sohbet',
    publisher: 'Geyik Yapım',
    feedUrl: 'https://media.rss.com/mizahsohbet/feed.xml',
    coverUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&q=80',
    category: 'Mizah & Eğlence',
    description: 'Haftanın komik olayları, samimi geyikler ve eğlenceli ikili sohbetler.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  },
  {
    id: 'spor-panoramasi',
    title: 'Spor Panoraması & Futbol',
    publisher: 'Taktik Tahtası',
    feedUrl: 'https://feeds.buzzsprout.com/987654.rss',
    coverUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80',
    category: 'Spor',
    description: 'Süper Lig, Şampiyonlar Ligi ve basketbol maçlarının taktik çözümlemeleri.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  },
  {
    id: 'kisisel-gelisim-atolyesi',
    title: 'Kişisel Gelişim & Zaman Yönetimi',
    publisher: 'Odağını Bul',
    feedUrl: 'https://anchor.fm/s/334455/podcast/rss',
    coverUrl: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&q=80',
    category: 'Psikoloji & Yaşam',
    description: 'Verimlilik teknikleri, hedef koyma ve alışkanlık kazanma rehberi.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  },
  {
    id: 'muzik-tarihi-sohbetleri',
    title: 'Müzik Tarihi & Enstrümanlar',
    publisher: 'Harmoni Kulübü',
    feedUrl: 'https://feed.podbean.com/muziktarihi/feed.xml',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
    category: 'Sanat & Edebiyat',
    description: 'Barok çağdan rock tarihine, bestecilerin hayatı ve albüm analizleri.',
    language: 'tr',
    verifiedAt: '2026-07-01',
    enabled: true
  }
];
