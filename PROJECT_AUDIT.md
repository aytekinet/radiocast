# RadioCast — FAZ 0 Proje Denetim ve Envanter Raporu

**Tarih:** 3 Kasım 2026  
**Durum:** Faz 0 Tamamlandı — Proje ve Veri Tabanı Koruma Altına Alındı

---

## 1. Kod Tabanı ve Paket Envanteri

- **Framework**: React 19.0.1 + Vite 6.2.0 + TypeScript 5.8.2 (SPA Mimari)
- **Sunucu / Backend**: Express 4.21.2 + `vite.middlewares` (Geliştirmede `server.ts`, üretimde statik servis)
- **Yardımcı Kütüphaneler**:
  - `fast-xml-parser`: Güvenli RSS/Atom XML besleme ayrıştırma
  - `hls.js`: `.m3u8` HTTP Live Streaming oynatıcı bağdaştırıcısı
  - `lucide-react`: Modern ve temiz SVG ikon seti
  - `motion`: Yumuşak geçişler ve modal animasyonları
  - `tailwindcss` v4: `@import "tailwindcss";` ile modern yardımcı sınıflar
- **Build & Lint Doğrulaması**: `npm run build` ve `tsc --noEmit` hatasız derleniyor.

---

## 2. Doğrulanan Katalog ve Veri Sayıları

- **Doğrulanmış Türkçe Podcast Kataloğu**: `src/data/generatedPodcastCatalog.json` içinde **133 adet** gerçek Türkçe podcast beslemesi (Aposto, Evrim Ağacı, Socrates, Beyhan Budak, Nilay Örnek vb.) doğrulanmıştır. Tümü geçerli RSS feedUrl, görsel ve kategoriye sahiptir.
- **Yerel Türkçe Radyo Veritabanı**: `src/data/allTurkishStations.json` içinde **629 adet** istasyon kaydı bulunmaktadır.
- **Doğrulanmış Fallback İstasyonlar**: `src/data/fallbackStations.ts` içinde 34 adet yüksek kaliteli, doğrudan çalınabilir Türkiye radyosu (Power FM, Kral Pop, TRT FM, Joy FM, Virgin Radio, Radyo Fenomen vb.) mevcuttur.

---

## 3. Depolama (Storage) ve Geriye Dönük Uyumluluk (Migration)

- **Mevcut LocalStorage Anahtarları**:
  - `radiocast_favorites` / `radio_favorites`: İstasyon favorileri
  - `radiocast_favorite_podcasts`: Takip edilen podcastler
  - `radiocast_history` / `radiocast_recently_played`: Oynatma geçmişi
  - `radiocast_podcast_progress`: Bölüm dinleme saniyeleri
  - `radiocast_settings`: Kullanıcı ayarları (tema, dil, ses)
- **Migration İlkesi**: Mevcut hiçbir anahtar silinmeyecek; `getStoredSettings`, `getStoredFavorites` ve `getPodcastProgress` fonksiyonları mevcut verileri güvenle okumaya devam edecek ve yeni alanlar için varsayılanlar (`tr`, `dark`, vb.) otomatik eklenecektir.

---

## 4. Başlangıçta Tespit Edilen Eksikler Listesi

1. 6 kademeli üstel gecikmeli (`[1, 2, 4, 8, 16, 30]` saniye) canlı radyo reconnect döngüsü eksik.
2. Uyku zamanlayıcısında son 30 saniyede sesi kademeli kısarak durdurma (fade-out) ve durdurup yeniden başlattığında ses seviyesini koruma eksik.
3. `/search?q=...&type=...` doğrudan taranabilir, derin bağlantılı ve çok sekmeli arama sayfası eksik.
4. Big Screen (büyük saat ve kapak modu, Escape ile çıkış) eksik.
5. Kullanıcı radyo grupları (favoriler içinde klasörleme) eksik.
6. Arayüzün TR / EN / RU tam çeviri sözlüğü eksik.

Bu envanter temel alınarak Faz 1 uygulamasına başlanmıştır.
