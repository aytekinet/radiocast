# RadioCast — TuneWake Master Dönüşüm ve Uygulama Planı

Mevcut RadioCast projesinin tüm çalışan bileşenlerini, 133 doğrulanmış Türkçe podcast ve 629 radyo istasyonunu koruyarak TuneWake referans deneyiminin bilgi mimarisi ve ürün kalitesini hayata geçiren kapsamlı dönüşüm ve mimari uygulama planıdır.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Kullanıcı tarafından onaylanan ve plana tam olarak yansıtılan bağlayıcı kararlar:

- **Mevcut Projeyi Koruma**: Sıfırdan yazma yapılmayacak. 133 doğrulanmış Türkçe podcast, 629 istasyonluk yerel veritabanı, mevcut Express sunucusu (`server.ts` & `src/serverApp.ts`), hızlı arama altyapısı ve `localStorage` favori/geçmiş verileri korunacak.
- **Marka ve Görsel Kimlik**: **RadioCast** marka adı; **Koyu Slate (#0A0F17) & Gece Mavisi (#111A26)** ana yüzeyleri, canlı mavi (#2563EB) vurgular ve yüksek kontrastlı açık tema desteği.
- **Tek Mantıksal Ses Oynatıcı**: Radyo ve podcastler tek bir `AudioEngine` (HTMLAudioElement) üzerinden çalınacak, sayfa geçişlerinde ses kesilmeyecek, yarış durumlarına karşı oturum belirteçleri (`sessionVersion`) kullanılacak.
- **Gerçek Veri İlkesi**: Uydurma/mock veri, çalışmayan buton veya sahte başarı durumu olmayacak; HLS, CORS, ağ kopması ve eksik podcast beslemeleri dürüstçe yönetilecek.

---

## 1. Mevcut Proje Analizi ve Tespit Edilen Eksikler

Yapılan detaylı kod tabanı denetiminde mevcut projenin güçlü yönleri ve TuneWake şartnamesine göre tamamlanması gereken eksikler tespit edilmiştir:

### A. Mevcut Güçlü Altyapı (Korunacaklar)
1. **Veri Varlıkları**:
   - `src/data/generatedPodcastCatalog.json`: 133 adet doğrulanmış Türkçe podcast beslemesi (Aposto, Evrim Ağacı, Socrates, Beyhan Budak vb.).
   - `src/data/allTurkishStations.json`: 629 adet yerel radyo kaydı.
   - `src/data/fallbackStations.ts`: 34 adet doğrudan çalınabilir doğrulanmış Türkiye istasyonu.
2. **Sunucu Mimarisi**:
   - `server.ts` ve `src/serverApp.ts`: Express üzerinde çalışan Radio Browser aynalama (`de1`, `nl1`, `at1`), SSRF korumalı RSS besleme proxy'si (`fast-xml-parser`) ve önbellekleme katmanı hazır.
3. **Mevcut Oynatıcı**:
   - `src/services/audioEngine.ts`: HLS.js entegrasyonu, temel dinleme konumu kaydı ve ses seviyesi yönetimi bulunuyor.

### B. Tespit Edilen Eksikler ve Giderilecek Alanlar
1. **6 Kademeli Otomatik Reconnect Eksikliği**:
   - Mevcut kodda bağlantı koptuğunda aday URL'ler taranıyor ancak TuneWake şartnamesindeki `[1, 2, 4, 8, 16, 30]` saniyelik üstel gecikmeli 6 deneme döngüsü ve kullanıcıya açık deneme sayacı (`Yeniden bağlanılıyor 2/6`) bulunmuyor.
2. **Uyku Zamanlayıcısında Kademeli Ses Kısma (Fade-Out)**:
   - Mevcut zamanlayıcı süresi dolunca sesi aniden kesiyor. Şartnamede istenen son 30 saniyede lineer ses kısma ve durdurup yeniden başlatıldığında orijinal sesi koruma mantığı eklenecek.
3. **Podcast ve Radyo Ayrımında Player Kontrolleri**:
   - Canlı radyoda seek çubuğunun kesin olarak devre dışı bırakılması ve sadece "LIVE" rozetinin gösterilmesi; podcastte ise 15 sn geri / 30 sn ileri, 0.8×–2.0× hız çarpanı ve bölüm kuyruğu geçişinin kusursuzlaştırılması gerekiyor.
4. **Çok Sekmeli Birleşik Arama Rotası (`/search?q=...&type=...`)**:
   - Arama şu an modal üzerinden yapılıyor; doğrudan taranabilir, yer imine eklenebilir ve "Tümü / Radyolar / Podcastler" sekmelerini URL query parametresiyle yöneten tam arama rotası eksik.
5. **Big Screen (Tam Ekran Saat ve Kapak Modu)**:
   - Gece komodin veya TV/masaüstü kullanımında minimalist büyük saat (12/24s), albüm kapağı ve ana kontrolleri sunan tam ekran modu mevcut değil.
6. **Çoklu Dil (i18n)**:
   - Arayüz metinleri ağırlıklı olarak Türkçe; şartnamede istenen TR / EN / RU anında dil değiştirme sözlüğü tam entegre değil.

---

## 2. Tüm Ekranlar ve Butonların Çalışma Mantığı

Uygulamada yer alacak tüm ekranlar ve her butonun somut etkileşim sözleşmesi:

### Ekranlar ve Rotalar

1. **Keşfet (Ana Sayfa) — `/` veya `/listen`**:
   - Türkiye'de ve dünyada popüler canlı radyolar, editörün seçtiği podcastler, son dinlenenler, tür rozetleri ve hızlı arama çubuğu.
2. **Radyolar — `/radio`**:
   - Ülke seçici (TR, RU, US, DE vb.), dil filtresi, tür etiketleri (Pop, Rock, Jazz, Haber, vb.), Popülerlik ve A–Z sıralaması, Liste/Grid görünüm toggle'ı, sayfalama.
3. **Radyo İstasyon Detayı — `/radio/:stationId`**:
   - Büyük logo, istasyon adı, yayın ülkesi/şehri, türü, bitrate/codec bilgisi, canlı dinle butonu, favoriye ekle, doğrudan web sitesi linki, bozuk yayın bildirme modalı.
4. **Podcastler — `/podcasts`**:
   - Popüler programlar, kategoriler (Haber, Teknoloji, Felsefe, Tarih vb.), yeni bölümler, manuel RSS ekleme butonu.
5. **Podcast Detayı — `/podcasts/:showId`**:
   - Program kapak görseli, yapımcı, açıklama, "Takip Et / Takibi Bırak", RSS kopyalama, kronolojik bölüm listesi, dinlendi/dinlenmedi filtresi.
6. **Bölüm Detayı — `/podcasts/:showId/episodes/:episodeId`**:
   - Bölüm başlığı, yayınlanma tarihi, süresi, sanitize edilmiş zengin show notes metni, hemen dinle ve kaldığı yerden devam et butonları.
7. **Birleşik Arama — `/search?q=...&type=...`**:
   - Tümü / Radyolar / Podcastler sekmeleri, sayfalama, filtreleme, anlık URL senkronizasyonu.
8. **Favoriler — `/favorites`**:
   - Kaydedilen istasyonlar, takip edilen podcastler ve kullanıcının oluşturduğu özel radyo grupları (örn. "Gece Cazı", "Haberler").
9. **Geçmiş — `/history`**:
   - Son dinlenen 40 istasyon ve podcast bölümleri, son oynatma anı, podcast dinleme konumu, onay diyaloglu geçmişi temizleme.
10. **Ayarlar — `/settings`**:
    - Tema seçimi (Koyu / Açık / Sistem), Arayüz dili (TR / EN / RU), varsayılan ses seviyesi, sonraki bölümü otomatik oynatma, önbelleği temizleme ve veri sıfırlama.
11. **Big Screen (Tam Ekran Görünüm)**:
    - Ekranı kaplayan minimalist dijital saat (12/24s), büyük kapak, yayın bilgisi, oynat/duraklat, ses ayarı; `Escape` tuşu ile çıkış.

### Butonların Davranış Sözleşmesi (Zero-Dead-Click)

- **Oynat / Duraklat (Play / Pause)**:
  - Tıklandığında `AudioEngine` durumuna göre ses açılır veya duraklatılır. Tarayıcı autoplay engeli verirse "Oynatmak için dokunun" uyarısı çıkar, kullanıcı etkileşimiyle açılır.
- **Önceki / Sonraki (Previous / Next)**:
  - Podcast modunda tanımlı çalma kuyruğundaki önceki/sonraki bölüme geçer. Canlı radyoda aktif filtrelenmiş listedeki bir sonraki istasyona geçer.
- **İlerleme / Seek Çubuğu**:
  - Yalnızca podcastlerde görünür. Tıklama ve sürükleme ile saniye bazında atlama yapılır (`currentTime`). Canlı radyoda gizlenir; yerine "CANLI YAYIN" kırmızı animasyonsuz rozeti konur.
- **+30 sn İleri / -15 sn Geri**:
  - Yalnızca podcast modunda aktiftir; bölüm içinde hassas atlama sağlar.
- **Hız Seçici (0.8×–2.0×)**:
  - Yalnızca podcastlerde açılır; seçilen hız `audio.playbackRate` üzerine uygulanır ve sonraki bölümlerde hatırlanır.
- **Kalp / Favori Butonu**:
  - Tıklandığında anında `localStorage` güncellenir; kart, detay ve oynatıcıdaki tüm kalp durumları iki yönlü senkron olur.
- **Uyku Zamanlayıcısı (Sleep Timer)**:
  - 15, 30, 45, 60, 90 dk veya özel süre seçilir. Canlı sayaç geri sayar. Süre bitimine 30 sn kala ses kademeli olarak (fade-out) kısılır ve müzik durur. İptal edilirse veya yeniden başlatılırsa orijinal ses düzeyi geri yüklenir.
- **RSS ile Podcast Ekle**:
  - Açılan modalda URL doğrulanır, sunucu tarafında SSRF denetiminden geçer, geçerliyse podcast kütüphanesine kaydedilir ve ilk bölümleri listelenir.
- **Paylaş (Share)**:
  - Mevcut radyo/podcast bağlantısı panoya kopyalanır (`navigator.clipboard`) ve kullanıcıya "Bağlantı kopyalandı" bildirimi verilir.

---

## 3. Radyo ve Podcast Arama Sonuçlarının Çalışma Mantığı

Global arama, yüzeysel bir filtreleme değil; harici API'ler ve yerel veritabanıyla entegre çalışan sağlam bir arama motoru olacaktır:

```
Kullanıcı Arama Inputuna Yazıyor
   │
   ├─► 300 ms Debounce + URL Encode
   │
   ├─► AbortController (Önceki geciken istek iptal edilir, yarış durumu engellenir)
   │
   ▼
İstemci / Sunucu Arama Birleştirici
   ├─► Radio Browser Arama (isim, etiket, ülke, dil) + Yerel 629 İstasyon Eşleştirmesi
   ├─► Apple Podcasts Search API (term, country) + Yerel 133 Doğrulanmış Podcast Eşleştirmesi
   │
   ▼
Sonuç Normalizasyonu ve Tekilleştirme (Deduplication)
   │
   ├─► "Tümü" Sekmesi: En popüler 6 Radyo + 6 Podcast
   ├─► "Radyolar" Sekmesi: Tam liste + Ülke/Dil/Tür filtreleri + Sayfalama
   └─► "Podcastler" Sekmesi: Tam liste + Kategori filtreleri + Sayfalama
```

- **Boş Sorgu & Minimum Karakter**: 2 karakterden az girildiğinde ağ isteği atılmaz; geçmiş aramalar ve popüler kategoriler gösterilir.
- **Kiril ve Türkçe Karakter Desteği**: Türkçe (ç, ğ, ı, ö, ş, ü) ve Rusça Kiril karakterler Unicode normalizasyonundan (`normalize('NFC')`) geçirilerek aranır.
- **Hata ve Boş Durumlar**: Sonuç bulunamadığında uydurma veri üretilmez; "Sonuç bulunamadı" açıklaması ve filtre temizleme önerisi sunulur. Ağ hatasında "Tekrar Dene" butonu çıkar.

---

## 4. Gerçek API, RSS ve Ses Oynatma Mimarisi

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            RadioCast Ses Mimarisi                           │
│                                                                             │
│  ┌────────────────────────── AudioEngine ────────────────────────────────┐  │
│  │ - Tek HTMLAudioElement (Sayfa geçişinde remount olmaz)                │  │
│  │ - Session Version Token (Eski stream olaylarının yeniyi ezmesini önler)│  │
│  │ - 6 Kademeli Reconnect: [1, 2, 4, 8, 16, 30] sn üstel gecikme         │  │
│  │ - Native Safari HLS + hls.js Adapter                                  │  │
│  │ - MediaSession API Entegrasyonu (Bildirim çubuğu & kilit ekranı)      │  │
│  │ - Otomatik Dinleme Konumu Kaydı (Pause, seek ve her 10 saniyede bir)  │  │
│  │ - 30 sn Kademeli Fade-Out Uyku Zamanlayıcısı                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│                ┌─────────────────────┴─────────────────────┐                │
│                ▼                                           ▼                │
│  ┌───────────────────────────┐               ┌───────────────────────────┐  │
│  │    Radio Browser Servisi  │               │   Podcast & RSS Servisi   │  │
│  │ - de1, nl1, at1 aynaları  │               │ - Apple Search / Lookup   │  │
│  │ - HTTPS url_resolved      │               │ - SSRF Korumalı Proxy     │  │
│  │ - lastcheckok filtresi    │               │ - Fast-XML-Parser         │  │
│  │ - 34 Fallback İstasyonu   │               │ - Enclosure MP3/AAC Oynat │  │
│  └───────────────────────────┘               └───────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Ağ Kopması ve Geri Bağlanma**: Canlı radyo koptuğunda oynatıcı hemen hata vermek yerine 6 kez artan sürelerle (1s, 2s, 4s, 8s, 16s, 30s) yayına yeniden bağlanmayı dener. Kullanıcı durdurursa döngü derhal sonlanır.
- **Doğrudan Akış (Direct Streaming)**: Ses dosyaları sunucumuzda gereksiz yere yeniden yayınlanmaz; doğrudan yayıncının güvenli enclosure veya radyo URL'sinden çalınır.
- **SSRF ve Güvenlik**: Harici RSS XML çekimlerinde sunucunun yerel IP'lere (`127.0.0.1`, `192.168.x`, `10.x`, metadata adresleri) erişimi katı kurallarla engellenir.

---

## 5. Masaüstü ve Mobil Tasarım Planı

Görsel sistem, TuneWake'in işlevsel sadeliğini Spotify benzeri modern bir karanlık atmosferle birleştirir:

### A. Masaüstü Düzeni (1024px – 1440px+)
- **Sol Kenar Çubuğu (Sidebar)**: 240px sabit genişlik; Logo, Ana Sayfa, Radyolar, Podcastler, Favoriler, Geçmiş, Big Screen ve Ayarlar menüsü.
- **Üst Bar (Top Bar)**: Canlı arama kutusu (debounced), TR/EN/RU dil seçici, tema değiştirici (Açık/Koyu/Sistem).
- **Orta İçerik Alanı**: Kart ızgaraları (`grid-cols-2 md:grid-cols-4 lg:grid-cols-6`), ferah boşluklar, zero-pill etiketleme.
- **Sabit Alt Oynatıcı (Player Bar)**: 84px yükseklik; sol tarafta kapak ve başlık, ortada oynatma kontrolleri ve süre çubuğu, sağ tarafta ses kaydırıcısı, hız, uyku zamanlayıcısı ve Big Screen butonu.

### B. Mobil Düzeni (360px – 430px)
- **Ergonomik Başparmak Alanı**: Alt tarafta 64px sabit navigasyon çubuğu (Keşfet, Radyo, Podcast, Favoriler).
- **Kompakt Mini Player**: Alt navigasyonun hemen üstünde 60px yüksekliğinde, içeriği engellemeyen, tek dokunuşla play/pause ve favori sunan, yukarı kaydırıldığında tam ekran oynatıcıya dönüşen kompakt mini player.
- **Dokunma Hedefleri**: Tüm butonlar en az 44×44px dokunma alanına (`min-w-[44px] min-h-[44px]`) sahiptir.

### C. Renk ve Tipografi Tablosu
- Zemin: `#0A0F17` (koyu), `#F8FAFC` (açık).
- Yüzey/Kartlar: `#111A26` (koyu), `#FFFFFF` (açık).
- Vurgu (Accent): `#2563EB` (canlı mavi), `#3B82F6` (hover).
- Canlı Rozeti: `#EF4444` (kırmızı).
- Başlık Yazı Tipi: Geometrik Modern Sans (`Plus Jakarta Sans` / `Outfit`).
- Metin & Sayaçlar: `Inter` ve `font-mono tabular-nums`.

---

## 6. Uygulama Aşamaları ve Test Kriterleri

### FAZ 0: Envanter, Yedekleme ve Proje Gerçekliğini Anlama
- **Hedef**: Mevcut dosya ağacını, 133 podcast ve 629 istasyon verisini doğrulamak, depolama anahtarlarını belirlemek ve `PROJECT_AUDIT.md` raporunu oluşturmak.
- **Test Kriteri**: Build ve lint hatasız çalışır; hiçbir veri kaybı olmadan envanter çıkarılır.

### FAZ 1: Tek Global Player, Gerçek Radyo Kataloğu ve Rota Altyapısı
- **Hedef**: `AudioEngine` durum makinesini (6 kademeli reconnect, `sessionVersion` yarış koruması) devreye almak; Radio Browser ayna mekanizması + yerel yedek katalog birleşimini tamamlamak; radyo filtrelerini (Ülke, Dil, Tür) bağlamak.
- **Test Kriteri**: Türkiye ve yurtdışı istasyonlar kesintisiz çalar; sayfa geçişlerinde ses durmaz; radyo kopmasında 6 kademeli yeniden bağlanma sayacı görünür; kullanıcı durdurunca reconnect iptal olur.

### FAZ 2: Podcast Kataloğu, RSS Ayrıştırıcı, Bölüm Oynatıcı ve Birleşik Arama
- **Hedef**: Apple Search API + RSS XML ayrıştırıcısını bağlamak; 15 sn geri / 30 sn ileri, hız ayarı, dinleme ilerlemesi ve kaldığı yerden devam etme özelliklerini kurmak; manuel RSS eklemeyi ve `/search` çok sekmeli arama sayfasını devreye almak.
- **Test Kriteri**: Gerçek podcast bölümleri açılır; seek çubuğu ve hız çalışır; yenileme sonrası saniye hatırlanır; arama Tümü/Radyolar/Podcastler sekmelerinde doğru sonuçları verir.

### FAZ 3: Görsel Sistem, Big Screen, Uyku Zamanlayıcısı, Çoklu Dil ve Favoriler
- **Hedef**: Koyu Slate / Gece Mavisi tasarımını responsive olarak tamamlamak; 30 sn fade-out uyku zamanlayıcısını, Big Screen modunu, kullanıcı radyo gruplarını, geçmiş temizleme onayını ve TR / EN / RU arayüz çevirilerini eklemek.
- **Test Kriteri**: Mobil 360px ve masaüstü 1440px görünümlerinde taşma olmaz; uyku zamanlayıcısı son 30 saniyede sesi kısarak durdurur; Big Screen açılıp Escape ile kapanır; dil anında değişir.

### FAZ 4: Kabul Testleri, Güvenlik, Performans ve Bitiş Raporu
- **Hedef**: 16 maddelik zorunlu kabul testini uygulamak, `FEATURE_CHECKLIST.md` ve `KNOWN_LIMITATIONS.md` dosyalarını oluşturmak.
- **Test Kriteri**: 16 kabul maddesinin tamamı kanıtlanarak doğrulanır; `compile_applet` hatasız tamamlanır.
