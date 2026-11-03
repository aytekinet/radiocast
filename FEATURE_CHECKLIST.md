# RadioCast — FEATURE_CHECKLIST.md

**Test Tarihi:** 3 Kasım 2026  
**Durum:** Tüm Temel ve İleri Seviye Özellikler Doğrulandı

---

## 1. Veri ve Katalog Doğrulaması
- [x] **133 Doğrulanmış Türkçe Podcast Kataloğu**: `src/data/generatedPodcastCatalog.json` + `src/data/curatedTurkishPodcasts.ts` korunarak istemciye ve arama motoruna bağlandı.
- [x] **629 Yerel Türkiye Radyosu**: `src/data/allTurkishStations.json` korundu.
- [x] **34 Yüksek Kaliteli Fallback İstasyonu**: `src/data/fallbackStations.ts` (Power FM, Kral Pop, TRT FM, Virgin Radio, Fenomen vb.) korundu.
- [x] **Veri Kaybı Yok**: Kullanıcı yerel hafızasındaki favoriler ve dinleme konumu sıfırlanmadı.

---

## 2. Tek Ses Motoru (AudioEngine) Güvenilirliği
- [x] **Tek Mantıksal Oynatıcı**: Uygulama genelinde tek bir `HTMLAudioElement` kullanılır; rota ve sekme geçişlerinde ses kesilmez.
- [x] **Session Version Token**: Her yeni oynatmada `currentSessionId` artırılarak önceki istasyonun gecikmiş hata/canplay olaylarının yeni istasyonu ezmesi engellendi.
- [x] **6 Kademeli Otomatik Reconnect**: Canlı radyo koptuğunda `[1, 2, 4, 8, 16, 30]` saniye aralıklı 6 deneme döngüsü ve canlı geri sayım sayacı eklendi.
- [x] **Kullanıcı Müdahalesi Önceliği**: Kullanıcı manuel durdurduğunda (`pause`, `stop`) veya başka istasyona geçtiğinde reconnect döngüsü anında iptal edilir.
- [x] **Uyku Zamanlayıcısı Kademeli Kısma (Fade-Out)**: Son 30 saniyede ses lineer olarak kısılarak kapatılır; kullanıcı daha sonra oynattığında ses 0'da kalmaz, orijinal seviyesine geri döner.
- [x] **HLS & HTTPS Desteği**: Native Safari HLS ve `hls.js` bağdaştırıcısı entegre.

---

## 3. Ekranlar ve Rotalar
- [x] **Keşfet (`/` veya `/listen`)**: Popüler Türkiye ve dünya radyoları, öne çıkan podcastler, hızlı tür filtreleri.
- [x] **Radyolar (`/radio`)**: Ülke, dil ve tür filtreleri, A-Z / popüler sıralama, liste ve ızgara görünümleri.
- [x] **Podcastler (`/podcasts`)**: Popüler programlar, kategoriler, detay sayfası ve RSS bölüm listeleri.
- [x] **Podcast Bölüm Oynatımı**: Seek çubuğu, 15 sn geri / 30 sn ileri, 0.8×–2.0× hız, dinleme konumu hafızası.
- [x] **Big Screen (Büyük Ekran)**: Dijital saat (12/24s), büyük kapak, Escape tuşu ile çıkış ve ana oynatma kontrolleri.
- [x] **Favoriler & Özel Gruplar (`/favorites`)**: Radyolar, takip edilen podcastler ve özel radyo grupları (`RadioGroup`).
- [x] **Geçmiş (`/history`)**: Son 40 istasyon ve podcast bölümleri, kaldığın yerden devam etme, onay diyaloglu temizleme.
- [x] **Ayarlar (`/settings`)**: TR / EN / RU çoklu dil seçimi, Koyu Slate / Açık tema seçimi, veri sıfırlama.

---

## 4. Kullanıcı Arayüzü & Erişilebilirlik
- [x] **Zero-Pill Kuralı**: Statik metinler gereksiz hap kutucuklarına hapsedilmedi; temiz tipografik ayraçlar (`·`) kullanıldı.
- [x] **Dokunma Hedefleri**: Mobil cihazlarda tüm butonlar en az 44×44px dokunma alanına sahiptir.
- [x] **Klavye Kısayolları**: `Space` (Play/Pause), `M` (Mute), `ArrowUp/Down` (Ses), `Escape` (Modalları kapat).
- [x] **Çoklu Dil Desteği**: TR, EN ve RU sözlükleri `src/services/localization.ts` ile tüm buton ve durum mesajlarına entegre edildi.
