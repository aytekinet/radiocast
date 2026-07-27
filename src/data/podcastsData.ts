import { PodcastShow } from '../types';

export const POPULAR_TURKISH_PODCASTS: PodcastShow[] = [
  {
    id: 'p-felsefe',
    title: 'Felsefeyle Tanış',
    publisher: 'Kültür & Felsefe Kulübü',
    category: 'Felsefe & Kültür',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    description: 'Antik Yunan’dan günümüze insan düşüncesini, Varoluşçuluğu ve hayatın anlamını sorgulayan felsefi sohbetler.',
    episodes: [
      {
        id: 'ep-f1',
        showId: 'p-felsefe',
        showTitle: 'Felsefeyle Tanış',
        title: 'Bölüm 1: Sokrates’in Savunması ve Bilgelik',
        description: 'Sokrates neden "Bildiğim tek şey, hiçbir şey bilmediğimdir" dedi? Sorgulanmamış bir yaşam yaşanmaya değer midir?',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        durationSeconds: 372,
        publishedDate: '18 Temmuz 2026',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
        category: 'Felsefe & Kültür'
      },
      {
        id: 'ep-f2',
        showId: 'p-felsefe',
        showTitle: 'Felsefeyle Tanış',
        title: 'Bölüm 2: Stoacılık ve Zihin Huzuru (Marcus Aurelius)',
        description: 'Kontrol edemediğimiz olaylar karşısında stoacı felsefe bize nasıl içsel huzur ve metanet sağlar?',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        durationSeconds: 423,
        publishedDate: '10 Temmuz 2026',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
        category: 'Felsefe & Kültür'
      },
      {
        id: 'ep-f3',
        showId: 'p-felsefe',
        showTitle: 'Felsefeyle Tanış',
        title: 'Bölüm 3: Varoluşçuluk - Sartre ve Özgürlüğün Sorumluluğu',
        description: 'Varoluş özden önce gelir. İnsan kendi kaderini çizerken duyduğu özgürlük bunaltısı nedir?',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        durationSeconds: 344,
        publishedDate: '02 Temmuz 2026',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
        category: 'Felsefe & Kültür'
      }
    ]
  },
  {
    id: 'p-teknoloji',
    title: 'Geleceğin Teknolojileri & Yapay Zeka',
    publisher: 'TechTR Medya',
    category: 'Bilim & Teknoloji',
    coverUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80',
    description: 'Yapay zeka, kuantum bilgisayarlar, yazılım dünyası ve dijital dönüşüm üzerine haftalık teknoloji sohbetleri.',
    episodes: [
      {
        id: 'ep-t1',
        showId: 'p-teknoloji',
        showTitle: 'Geleceğin Teknolojileri & Yapay Zeka',
        title: 'Yapay Zeka Devrimi ve AGI Çağı',
        description: 'Büyük dil modellerinden insan düzeyinde yapay zekaya (AGI) giden yolculukta bizi neler bekliyor?',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        durationSeconds: 502,
        publishedDate: '21 Temmuz 2026',
        coverUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80',
        category: 'Bilim & Teknoloji'
      },
      {
        id: 'ep-t2',
        showId: 'p-teknoloji',
        showTitle: 'Geleceğin Teknolojileri & Yapay Zeka',
        title: 'Yazılımcılığın Geleceği ve Agent Teknolojileri',
        description: 'AI Coding Agent’ları ve otonom yazılım geliştirme araçları mühendislik süreçlerini nasıl değiştiriyor?',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        durationSeconds: 461,
        publishedDate: '12 Temmuz 2026',
        coverUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80',
        category: 'Bilim & Teknoloji'
      }
    ]
  },
  {
    id: 'p-socrates',
    title: 'Socrates Podcast: Spor & Kültür',
    publisher: 'Socrates Dergi',
    category: 'Spor & Sohbet',
    coverUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80',
    description: 'Futbol, basketbol, tenis ve dünya spor tarihinden en keyifli hikayeler ve derinlemesine analizler.',
    episodes: [
      {
        id: 'ep-s1',
        showId: 'p-socrates',
        showTitle: 'Socrates Podcast: Spor & Kültür',
        title: 'Futbolun Efsaneleri: Unutulmaz Dünya Kupası Anları',
        description: 'Pelé, Maradona ve Cruyff dönemlerinden günümüze dünya kupası tarihine damga vuran maçlar.',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        durationSeconds: 580,
        publishedDate: '20 Temmuz 2026',
        coverUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80',
        category: 'Spor & Sohbet'
      },
      {
        id: 'ep-s2',
        showId: 'p-socrates',
        showTitle: 'Socrates Podcast: Spor & Kültür',
        title: 'NBA Taktiği ve Altın Çağlar',
        description: '90’lar Chicago Bulls efsanesinden modern Steph Curry üçlük devrimine basketbolun dönüşümü.',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        durationSeconds: 429,
        publishedDate: '15 Temmuz 2026',
        coverUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&q=80',
        category: 'Spor & Sohbet'
      }
    ]
  },
  {
    id: 'p-psikoloji',
    title: 'Kendine İyi Bak: Psikoloji & Farkındalık',
    publisher: 'Uzman Psikolog Zeynep Yılmaz',
    category: 'Psikoloji & Kişisel Gelişim',
    coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
    description: 'Stres yönetimi, duygusal dayanıklılık, mindfulness ve ilişkiler üzerine bilimsel ve samimi rehber.',
    episodes: [
      {
        id: 'ep-p1',
        showId: 'p-psikoloji',
        showTitle: 'Kendine İyi Bak: Psikoloji & Farkındalık',
        title: 'Tükenmişlik Sendromu ve Sınır Koyabilme',
        description: 'Günlük hayat koşturmacasında "Hayır" diyebilmek ve zihinsel enerjiyi korumanın yolları.',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        durationSeconds: 425,
        publishedDate: '22 Temmuz 2026',
        coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
        category: 'Psikoloji & Kişisel Gelişim'
      },
      {
        id: 'ep-p2',
        showId: 'p-psikoloji',
        showTitle: 'Kendine İyi Bak: Psikoloji & Farkındalık',
        title: 'Kaygı ve Anksiyete ile Başa Çıkma Yöntemleri',
        description: 'Nefes egzersizleri, Bilişsel Davranışçı Terapi teknikleri ve anı yaşayabilme (Mindfulness).',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        durationSeconds: 531,
        publishedDate: '14 Temmuz 2026',
        coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
        category: 'Psikoloji & Kişisel Gelişim'
      }
    ]
  },
  {
    id: 'p-tarih',
    title: 'Mesela Yani: Tarihten Sıra Dışı Hikayeler',
    publisher: 'Tarih Araştırmaları',
    category: 'Mizah & Hikaye',
    coverUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&q=80',
    description: 'Tarihin tozlu sayfalarından çıkan ilginç casusluk olayları, gizemli kaşifler ve eğlenceli tarihi anekdotlar.',
    episodes: [
      {
        id: 'ep-h1',
        showId: 'p-tarih',
        showTitle: 'Mesela Yani: Tarihten Sıra Dışı Hikayeler',
        title: 'İpekyolu Kaşifleri ve Kayıp Şehirler',
        description: 'Çölün ortasında unutulmuş antik kentlerin keşfi ve gezginlerin büyüleyici seyahatnameleri.',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        durationSeconds: 588,
        publishedDate: '19 Temmuz 2026',
        coverUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&q=80',
        category: 'Mizah & Hikaye'
      }
    ]
  }
];

