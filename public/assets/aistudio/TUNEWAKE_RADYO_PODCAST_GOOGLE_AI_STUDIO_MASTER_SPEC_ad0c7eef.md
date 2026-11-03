# GOOGLE AI STUDIO — RADYO + PODCAST PLATFORMU / MASTER DÖNÜŞÜM ŞARTNAMESİ

**Referans ürün:** https://www.tunewake.com/  
**Referans web oynatıcı:** https://www.tunewake.com/listen/  
**Doküman tarihi:** 3 Kasım 2026  
**Belge türü:** Araştırmaya dayalı ürün gereksinimleri + UI/UX şartnamesi + teknik mimari + AI Studio uygulama talimatı + kabul testleri  
**İstenen sonuç:** Mevcut Google AI Studio projesini, TuneWake'in kullanıcı akışlarına ve ürün kapsamına yakın, ancak kendi markası ve özgün görsel kimliği olan **gerçekten çalışan** bir internet radyosu ve podcast web uygulamasına dönüştürmek.

> **İLK OKUNACAK TALİMAT (GOOGLE AI STUDIO AJANI İÇİN):** Bu belgeyi proje uygulama sözleşmesi olarak kullan. Mevcut proje dosyalarını ve bağımlılıkları önce incele; çalışan özellikleri, kullanıcı verilerini ve dağıtım yapılandırmasını koru. Uygulamayı sıfırdan başlatıp mevcut projeyi silme. Uygulanabilir değişiklikleri aşamalı yap. İşlevsellik, veri kaynakları, oynatma, arama ve testler eksiksiz çalışmadan yalnızca etkileyici bir mockup üretip 'tamamlandı' deme. Başka bir sitenin kaynak kodunu, marka adını, logolarını, metinlerini veya özgün grafiklerini kopyalama. Referans siteden **ürün davranışı ve bilgi mimarisi** için yararlan; kendine özgü ürün çıkar.

---

## 0. DOĞRULUK SEVİYESİ VE ARAŞTIRMANIN SINIRLARI

Bu belge üç tür kayıt içerir:

- **[D] Doğrulandı:** TuneWake'in resmi sayfalarında, halka açık ürün açıklamasında veya resmi API belgelerinde açıkça ifade edilen işlev.
- **[Ç] Çıkarım:** Yayınlanan ürün bilgisine dayanılarak önerilen tutarlı arayüz/akış davranışı; birebir canlı UI davranışı doğrulanmış değildir.
- **[Ö] Önerimiz:** Referansa yakın ama bizim ürünümüz için belirlenmiş yeni tasarım, teknik çözüm veya ek işlev.

**Önemli sınırlama:** Referansın kamuya açık HTML/sayfa açıklamaları, radyo/podcast detay sayfaları, Google Play ürün açıklaması, resmi çalışma sistemi belgesi ve API dokümanları incelendi. Tarayıcı içinde her menüye gerçek kullanıcı tıklaması yapılmış, her açılır pencere ve her piksel ekran görüntüsüyle doğrulanmış **değildir**. Bu nedenle birebir tasarım ölçülerini veya görünmeyen modal ayrıntılarını 'TuneWake'in kesin davranışı' diye sunma. Aşağıdaki UI ölçüleri ve mikro-etkileşimler **[Ö] uygulanacak tasarım spesifikasyonudur**. Bu belge, eldeki kanıtlara göre kapsamlı yeniden uygulama planıdır; TuneWake'in özel kaynak kodunun tersine mühendislik dökümü değildir.

**Kapsam:** Öncelik **web uygulaması**. TuneWake'in mobil uygulamasındaki güvenilir Android alarm işlevi ile web oynatıcı işlevleri aynı şey değildir. Web tarayıcısı bilgisayar uyurken güvenilir alarm veremez. İlk sürüme gerçek native alarm vaadi ekleme.

### 0.1 Doğrulanmış temel ürün özellikleri

| İşlev | Durum | Kanıtın kapsamı |
|---|---|---|
| 30.000+ çalışır HTTPS radyo istasyonunu listeleme | [D] | TuneWake tanıtımı, radyo açıklaması; sayı zamanla değişir |
| Radio Browser katalog entegrasyonu | [D] | TuneWake How It Works |
| İstasyon adı, ülke, dil ve türe göre arama/tarama | [D] | TuneWake web oynatıcı ve radyo rehberi |
| Popüler / A–Z sıralama, Play all | [D] | TuneWake web oyuncusu açıklaması |
| Radyo favorileri, kalp tuşu, preset | [D] | TuneWake web oynatıcı |
| Son 40 dinlenen istasyon / geçmiş temizleme | [D] | TuneWake web oynatıcı |
| Aynı oynatıcıda radyo ve podcast oynatma | [D] | TuneWake web oynatıcı |
| Podcast popüler listeleri, kategoriler ve yayın sayfası | [D] | TuneWake podcast listesi ve detay sayfaları |
| Podcast kaynağı: Apple Podcasts kataloğu/liste + yapımcının RSS'i | [D] | TuneWake How It Works |
| Podcastlerde hız 0.8×–2× | [D] | TuneWake web oynatıcı |
| Podcastte devam etme, 15 sn geri / 30 sn ileri, takip, okunmamış bölümler | [D: mobil] | Google Play açıklaması; webde birebir kapsamı farklı olabilir |
| RSS adresinden podcast ekleme | [D: mobil] | Google Play ve How It Works; kendi web projemize de eklenecek |
| Sleep timer, süre bitiminde 30 sn ses kısma | [D] | TuneWake web oynatıcı ve ürün tanıtımı |
| Big screen / tam ekran saat ve kapak | [D] | TuneWake web oynatıcı |
| Space, M, /, yön tuşları, medya tuşları | [D] | TuneWake web oynatıcı |
| Koptuğunda artan aralıklarla maksimum 6 yeniden bağlanma denemesi | [D] | TuneWake web açıklaması |
| Radio Browser erişilmezse önceden seçilmiş 34 istasyonluk fallback | [D] | TuneWake nasıl çalışır |
| Hesapsız kullanım, yerel cihaz/tarayıcıda veriler | [D] | TuneWake tanıtımı/gizlilik politikası |
| Ülke/tür/dil, radyo detay ve podcast detay SEO sayfaları | [D] | Site adresleri ve içerik |
| 15 dil / görünüm: açık-koyu-sistem | [D: mobil] | Google Play açıklaması; birebir web kapsamı doğrulanmadı |
| Tarayıcı uyurken çalan alarm | [D: yok] | TuneWake web oynatıcı bunu özellikle sunmuyor |

---

## 1. HEDEF ÜRÜNÜN TANIMI VE BAŞARI ÖLÇÜSÜ

Yapılacak proje: Tek bir sade ve hızlı arayüz üzerinden hem **dünya radyolarını** hem de **podcastleri** bulup dinleme platformu. Kullanıcı üç tık içinde bir radyo dinlemeye başlayabilmeli; bir podcasti arayıp yayının bütün bölümlerini görebilmeli; tarayıcıda sayfa değiştirirken medya çalmaya devam etmeli.

**Ana hedefler:**
1. Gerçek, canlı API verisi; boş/uydurma istasyon ve podcast kartları değil.
2. Gerçek medya oynatma; tek paylaşımlı player, düzgün play/pause/seek/hız/volüm.
3. Güçlü arama; radyo ve podcast sonuçlarını doğru ayrıştırma, filtreleme, boş durumlar.
4. Radyo keşfi; popüler, ülkeler, diller, türler, yeni keşif ve detaylar.
5. Podcast keşfi; popülerler, kategoriler, program sayfası, bölüm sayfası ve RSS.
6. Favoriler, son dinlenenler, podcast takibi, kalıcı podcast ilerleme verisi.
7. Responsive, sade, hızlı ve erişilebilir tasarım.
8. Yükleme, hata, çevrimdışı, bozuk yayın, timeout ve API kesintisi durumlarını gerçek şekilde yönetme.

**Ürün kapsamı kararı:** Web için freemium, üyelik, ödeme, reklam veya alarm zorunlu değil. Önce ücretsiz/hesapsız, güvenilir oynatma. Gerekirse kullanıcı hesabı/senkronizasyon çok sonraki aşama.

**Kendi marka kimliği:** Geçici proje adı `RADIOCAST` (değiştirilebilir). TuneWake adını, logosunu, metinlerini, mağaza değerlendirmelerini, tescilli ekran görüntülerini veya özel kaynak dosyalarını kullanma. Radyo/podcast yayıncılarının eser/logo kullanımına ilişkin lisans/attribution haklarını gözet.

---

## 2. BİLGİ MİMARİSİ — İKİ KATMAN

### Katman A: Halka açık tanıtım ve keşif sayfaları

Referansta doğrulanmış örnekler:
- `/` — tanıtım/hero, popüler radyo ve podcast, keşif kategorileri, aramaya yönlendirme.
- `/radio/` — radyo rehberi.
- `/radio/usa/`, `/radio/russia/` — ülke bazında radyo listeleri.
- `/radio/genre/pop/` — tür bazında radyo listeleri.
- `/radio/usa/radio-paradise-main-mix/` — istasyon detay.
- `/podcasts/` — popüler podcastler, kategoriler.
- `/podcasts/the-daily/` — podcast detay, bölüm listesi.
- `/listen/` — canlı, interaktif web oynatıcısı.

### Katman B: Tek sayfalı dinleme deneyimi [Ö: proje mimarisi]

Önerilen ve doğrudan yönlendirilebilir URL planı:

| URL | Sayfa/ekran | Olması gereken iş |
|---|---|---|
| `/` | Ana keşif | Popüler ülkeli istasyonlar, dünya radyoları, podcast önerileri, arama |
| `/listen` | Dinleme ana ekranı | Home, popüler radyo, popüler podcast, kısayollar ve player |
| `/radio` | Radyo keşfet | Ülke/dil/tür filtreleri, sıralama, liste/grid |
| `/radio/country/:countryCode` | Ülke | TR, RU, US vb. için gerçek sonuçlar |
| `/radio/genre/:genre` | Tür | rock, pop, jazz, news, talk vb. |
| `/radio/language/:languageCode` | Dil | Türkçe, Rusça, İngilizce vb. |
| `/station/:stationUUID` | İstasyon | Yayın, kapak, ülke, dil, bitrate, codec, website, benzerler |
| `/podcasts` | Podcast keşfet | Popüler, kategoriler, ülke, yeni bölümler |
| `/podcasts/category/:categoryId` | Podcast kategori | Kategoriye ait gerçek yayınlar |
| `/podcast/:podcastId` | Program detay | Kapak, yayıncı, açıklama, takip, RSS, bölüm listesi |
| `/podcast/:podcastId/episode/:episodeId` | Bölüm detay | Bölüm açıklaması, süre, tarih, oynatma ve hız |
| `/search?q=...&type=all` | Arama sonuçları | Tümü/Radyolar/Podcastler/Bölümler sekmeleri |
| `/favorites` | Kaydedilenler | Radyo presetleri + takip edilen podcastler, filtre |
| `/history` | Son dinlenenler | İstasyon ve bölümler, oynama zamanı, temizleme |
| `/settings` | Tercihler | Tema, dil, ülke, otomatik oynatma, veri sıfırlama |
| `/about`, `/privacy`, `/terms`, `/report` | Bilgi/hukuk | Çalışan sayfalar ve iletişim formu |
| `/404` | Bulunamadı | Ana sayfaya dönüş ve arama |

**Yönlendirme:** Var olan projede farklı route mimarisi varsa onu koruyup bu yolları uyumlu ekle. Tarayıcı geri-ileri butonları çalışmalı. Bir bağlantı yeni sekmede açılabilmeli. Sayfa değiştirme ses elementini yeniden mount edip yayını kesmemeli.

---

## 3. TASARIM DİLİ — SADE, MODERN, İŞLEVSEL [Ö]

> Aşağıdaki renk ve piksel değerleri TuneWake'in ölçülmüş tasarım tokenları **değildir**; benzer sadelikte özgün, uygulanabilir tasarım önerisidir.

### 3.1 Görsel sistem

- Ana yaklaşım: Radyo ve podcast kapaklarını öne çıkaran temiz arayüz, yüksek kontrast, az görsel gürültü.
- Desktop: Dar sabit/katlanabilir sol gezinme alanı, üstte arama/filtre/tema, ortada içerik, altta sürekli mini player.
- Mobil: Üstte kısa başlık + arama, ana içerik tek kolon / iki kolon kartlar, altta mini player ve kolay erişimli alt gezinme.
- Arka plan: Açık mod `#F7F8FA`, kart `#FFFFFF`, yazı `#17212B`, ikincil `#627083`, sınır `#E5E9EF`.
- Koyu mod: Zemin `#0F141A`, yüzey `#19212B`, yazı `#F4F7FA`, ikincil `#AAB6C4`, sınır `#303B47`.
- Vurgu: `#3278F6` veya marka rengi olarak tek, kendimize ait ton. Hata `#DC4545`, canlı yayın rozeti `#E64D4D`.
- Tipografi: System UI / Inter benzeri; gövde 14–16px; başlık 22–30px; kart adı 15–16px.
- Köşeler: kart 12px; buton 10px; input 12px; küçük rozet 99px.
- Grid boşlukları: 8 / 12 / 16 / 24 / 32px ölçeği.
- Minimum dokunma alanı: 44×44px; focus ring görünür.
- Animasyonlar: 150–250ms; `prefers-reduced-motion` varsa kapat.
- İstasyon logolarını `object-fit: contain`, podcast kapaklarını `object-fit: cover` göster; bozuk görselde akıllı harfli fallback.

### 3.2 Desktop örnek iskelet

```text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ LOGO  │  [ İstasyon, podcast veya bölüm ara...                      🔎 ]  🌐  ☾  ⚙ │
├───────────────┬─────────────────────────────────────────────────────────────────────┤
│ 🏠 Ana sayfa  │  Dinlemeye başla                                    [Tümünü gör]   │
│ 📻 Radyolar   │  [ Öne çıkan radyolar — yatay kartlar / grid ]                       │
│ 🎙 Podcastler │  Popüler podcastler                                  [Tümünü gör]   │
│ 🔎 Arama      │  [ Podcast kapakları ve başlıkları ]                                │
│ ♥ Favoriler  │  Türlere göre keşfet                                                    │
│ 🕘 Geçmiş     │  [ Pop ] [ Rock ] [ News ] [ Jazz ] [ Talk ] [ Classical ]           │
│ 🌍 Ülkeler    │  Ülkelere göre keşfet                                                │
│ ⚙ Ayarlar    │  [ Türkiye ] [ Rusya ] [ ABD ] [ Almanya ] ...                       │
├───────────────┴─────────────────────────────────────────────────────────────────────┤
│ [Kapak]  Başlık / İstasyon   ♥  ⏮  ▶/⏸  ⏭ │ canlı/ilerleme │ 🔊──── │ ⛶ │ ⏲    │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Mobil örnek iskelet

```text
┌─────────────────────────┐
│ LOGO              🔍 ☾ │
│ Merhaba, ne dinleyelim? │
│ [ Radyo veya podcast ara ]
│ Popüler radyolar  Tümü  │
│ [📻 kart] [📻 kart]     │
│ Podcastler        Tümü  │
│ [🎙 kart] [🎙 kart]     │
│ Kategoriler              │
│ [Pop] [Haber] [Jazz]    │
├─────────────────────────┤
│ Kapak  Yayın    ▶  ♥     │  ← mini player
├─────────────────────────┤
│ 🏠     📻     🎙     ♥    │  ← alt menü
└─────────────────────────┘
```

### 3.4 Etkileşim kuralları

- Kartın ana gövdesine tıklama -> detay; ayrıca net **Oynat** tuşuna tıklama -> hemen o medyayı çal.
- Hover/focus'ta play kontrolü görünür; dokunmatik cihazda play her zaman erişilebilir.
- Aynı anda tek ses oynat; yeni bir medya seçilince eskisini durdur ve kaynağı değiştir.
- Başarılı kalp/takip işleminde anında görsel geri bildirim ve kalıcı veri.
- Loading/skeleton, boş sonuç, ağ yok, stream çalışmıyor, erişim reddi, podcast feed bozuk, resim yüklenemedi: her biri ayrı durum.
- Tüm ikonların anlamlı `aria-label` ve tooltip'i olsun; yalnızca ikonla belirsiz işlem bırakma.
- Player altta görünür ve sayfa geçişinde kesilmez; kullanıcı hiçbir kaynak seçmemişse kompakt rehber metni.

---

## 4. TÜM SAYFALARIN İÇERİK VE BUTON ENVANTERİ

### 4.1 Üst bar

| Kontrol | Tık/klavye davranışı | Teknik koşul |
|---|---|---|
| Logo | `/` sayfasına gider | çalan medya devam eder |
| Global search input | Yazarken öneri; Enter ile `/search` | debounce, erişilebilir |
| Arama `×` | metni temizler, önerileri resetler | boş aramada sonuç uç noktası çağırma |
| Arama simgesi | aramayı çalıştırır | input ile aynı sonuç |
| Arama önerilerindeki öğe | radyo/podcast detaya veya hemen oynatmaya gider | seçimi düzgün ayır |
| Dil menüsü | TR / EN / RU (ilk etap) | menü metinleri anında çevrilir |
| Tema değiştir | açık / koyu / sistem | cihaz tercihine uyumlu, kalıcı |
| Ayarlar | `/settings` | ses kesilmez |
| Mobil menü | drawer aç/kapat | Escape ile kapanır |

### 4.2 Sol yan menü / mobil alt gezinme

- **Ana Sayfa** → ana keşif.
- **Radyolar** → radyo kataloğu ve filtreler.
- **Podcastler** → podcast kataloğu ve kategoriler.
- **Ara** → arama kutusuna odaklan veya `/search`.
- **Favoriler** → kaydedilen istasyonlar ve takip edilen programlar.
- **Son Dinlenenler** → radyo + podcast geçmişi.
- **Ülkeler / Türler / Diller** → keşif sayfaları, uygun mobil yerleşim.
- **Big Screen** → saat + oynatıcı tam ekran modu.
- **Ayarlar, Hakkında, Gizlilik, Destek** → çalışan sayfalar.
- **Uygulamayı Yükle** → PWA kurulumu destekleniyorsa uygun açıklama; değilse görünmesin.

### 4.3 Ana sayfa bölümleri

1. Üst hero: `Dünyanın radyoları ve podcastleri bir arada` + global arama + hemen dinle CTA.
2. **Bulunduğun / seçtiğin ülkenin popüler radyoları**: ülke tercihini kullan; lokasyona erişim izni istemek zorunda değil.
3. **Dünyada popüler radyolar**.
4. **Popüler podcastler**.
5. **Radyo türleri** (Pop, Rock, News, Talk, Sports, Oldies, 80s, 90s, Classical, Jazz, Dance, Electronic; daha fazlası).
6. **Ülkelere göre keşfet** (Türkiye, Rusya, ABD, İngiltere, Almanya, Fransa, diğerleri).
7. **Dile göre keşfet** (Türkçe, Rusça, İngilizce vb.).
8. **Podcast kategorileri** (haber, toplum-kültür, komedi, gerçek suç, tarih, iş, bilim, teknoloji, eğitim, sağlık, spor, sanat, TV-film, müzik, aile, kurgu, hobi, manevi içerikler).
9. **Kaldığın yerden devam et**: yalnızca kullanıcının podcast ilerlemesi varsa.
10. **Son dinlediklerin** ve **favorilerin**: boşsa anlamlı CTA.

Her başlıkta `Tümünü Gör` varsa gerçek ilgili sayfaya gitsin. Kartlarda gerçek yayın ismi, doğru yayıncı/ülke ve gerçek artwork kullan.

### 4.4 Radyo keşif sayfası

- Başlık, kısa açıklama, arama kutusu.
- Filtreler: ülke, dil, tür, varsa asgari bitrate, `HTTPS / Çalışıyor` (API filtreleme veya yerel filtre).
- Sıralama: Popüler (clickcount), A–Z, isteğe bağlı Yeni/Trend (gerçek veri destekliyorsa).
- Görünüm: grid/list toggle. Seçim kalıcı.
- `Filtreleri temizle`, `Daha fazla yükle`, `Tümünü oynat`.
- Her kart: logo/fallback, istasyon adı, ülke/kent, dil, türe dair etiket, canlı rozeti, oynat, favori, detay.
- Birden fazla API sayfasında `limit` ve `offset`; duplicate stationuuid tekilleştirilir.
- Filtre değişince önceki request iptal edilir; eski veri yeni sorgunun altında görünmez.
- Ülke/dil listesi API'den alınır, statik etiket ve gerçek parametre eşleştirmesi ayrı tutulur.

### 4.5 İstasyon detay sayfası

- Görsel, istasyon adı, **LIVE** rozeti, ülke, şehir, dil, tür.
- `Dinle / Duraklat`, `♥ Favoriye ekle/çıkar`, `Paylaş`, `İstasyonun web sitesi`, `Bozuk yayın bildir`.
- Detaylar: stationuuid, codec (MP3/AAC vb.), bitrate (kbps), HTTPS, varsa ülke/eyalet, son kontrol zamanı; eksik alanları `Bilinmiyor` diye açık göster.
- `Benzer istasyonlar` için aynı tür/ülke/dil benzerliği; sırf ada göre rastgele öneri üretme.
- `Bu ülkeden diğerleri` ve `Bu dilde diğerleri` alanları.
- Yayın koptuğunda o istasyonun sağlıklı alternatifi varsa `Alternatif yayını dene`; otomatik başka istasyona gizlice geçme.
- Canonical route stable UUID kullanır; SEO amaçlı okunur slug eklenebilir ancak UUID temel kimliktir.

### 4.6 Podcast keşif sayfası

- `Popüler Programlar`, ülke seçici, kategoriler, podcast arama.
- Program kartı: kapak, program adı, yapımcı, dil, kategori, yayın türü, takip et, detay.
- Açıkça belirtilen bölüm sayıları ve tarihler RSS'ten doğrulanmalı; yoksa tahmini sayı verme.
- Kategori sayfasında sonuç sayısı ancak gerçek veri varsa göster.
- Apple listelerindeki sıralama tarihini belirt; listeler bayat ise `Son güncellenme`.
- `RSS ile ekle` tuşu -> feed giriş modalı, geçerli RSS doğrulama, başarılı ekleme.
- `Takip ettiklerim` veya Library alt bölümü.

### 4.7 Podcast program detay sayfası

- Üst: büyük kapak, başlık, yapımcı, kategori, dil, kısa açıklama, `Daha fazla`.
- Aksiyonlar: `En yeni bölümü oynat`, `Takip et/Takibi bırak`, `Paylaş`, `RSS bağlantısını kopyala`, `Kaynağa git`.
- Sekmeler/alanlar: **Bölümler**, **Hakkında**, **Benzer Podcastler**.
- Bölüm listesi: bölüm adı, yayın tarihi, süre, kısa açıklama, play/pause, kaldığın yerden devam, dinlendi etiketi, kaydet (opsiyonel).
- Filtre `Tümü / Dinlenmemiş / Dinlenmiş`; sıralama `En yeni / En eski`.
- Bölümler 20'şerli sayfalanır / `Daha fazla`.
- Silinmiş enclosure, DRM, premium-only veya oynatılamayan bölümler açıkça belirtilir; sahte ses üretme.

### 4.8 Podcast bölüm detay ekranı

- Program adı + bölüm başlığı, tarih/süre, açıklama/show notes (güvenli sanitize edilmiş HTML veya plain text).
- `Oynat / Duraklat`, `15 sn geri`, `30 sn ileri`, `İlerleme çizgisi`, `Oynatma hızı`, `Sesi ayarla`, `Takip et`, `Paylaş`, `Dinlendi işaretle`.
- Kayıt anlık değil; ilerleme örn. 10-15 saniyede bir ve pause/ended/unload sırasında yazılır.
- Bölüm tamamlanma eşiği önerisi: son 30 saniye veya %95; ayrıca manuel işaretleme.
- Podcast bölümünün oynatma zamanı program bazında saklanır; sekmeler arası kaldığı yerden devam.
- Otomatik sıradaki bölüme geçiş sadece kullanıcı tercihi açıksa; ekranda hangi bölümün geleceğini göster.

### 4.9 Favoriler

- Alt sekmeler: `Radyolar` / `Podcastler` / `Kaydedilen Bölümler` (sonuncusu P1).
- Kalp durumu iki yönde güncellenir: kart, detay, player, favoriler sayfası senkron.
- Sıralama: eklenme tarihi, A–Z, özel sıra.
- `Grup oluştur`, `Gruba ekle/çıkar`, `Grup adını değiştir`, `Grubu sil` [P1]. Grup içi next/previous yalnızca o grupta gezinir.
- Boş ekran: `Henüz favorin yok. Radyoları keşfet`.
- Yerel veri: stationUUID / podcastID / RSS URL, tüm API nesnesinin bayat kopyası değil.

### 4.10 Son dinlenenler

- Radyo ve podcast bölümleri ayrı tür ikonuyla; en yeni üstte.
- Oynatma anı, içerik adı ve isteğe bağlı kaldığın bölüm süresi.
- Son 40 istasyon saklama referanstaki [D]; bizim ürünümüzde 40 radyo + 100 podcast bölümü üst sınırı [Ö].
- `Geçmişi temizle`: onay diyalogu ve geri alınabilir toast [Ö].
- Favoriler veya takip verisi geçmiş temizlenince silinmez.

### 4.11 Ayarlar

- Tema `Sistem/Açık/Koyu`.
- Dil `Türkçe / English / Русский` (ek diller yeni paketlerle).
- Varsayılan ülke `TR/RU/US/diğer`.
- Radyo başlangıç sesi, arayüzde `Otomatik çalma` tercihi (tarayıcı autoplay kuralı mutlaka geçerli).
- Podcast hızı `0.8/1/1.2/1.5/1.75/2`.
- `Sonraki bölümü otomatik oynat` açık/kapalı.
- Çerez/gizlilik ayarları, verileri sıfırla, uygulama sürümü, hata bildir.

---

## 5. GLOBAL ARAMA: SAYFALAR, SONUÇLAR, FİLTRELER, HATALAR

**Arama bu projenin temel özelliğidir; sadece kart filtreleyen sahte search input kabul edilmez.**

### 5.1 Arama açılır alanı

- Üst çubuktaki arama tüm ekranlarda görünür (mobilde simge -> tam genişlik panel).
- Placeholder: `Radyo, podcast, bölüm veya kategori ara...`.
- 2 karakterden sonra, 250–400ms debounce ile öneri. `q.trim()` boşken ağ çağrısı yok.
- Başlarken geçmiş aramalar / popüler kategoriler (yerel) gösterilebilir.
- `ArrowDown`, `ArrowUp`, `Enter`, `Escape`; aria-activedescendant ve liste rolleri doğru.
- Arama sırasında `spinner`, başarısız API'de `Tekrar dene`, boş sonuçta `Aramayı değiştir`.
- X işareti sorguyu temizler, inputa odak bırakır.

### 5.2 `/search` sonuç ekranı

- Başlık: `"jazz" için sonuçlar`.
- Üst sekmeler: `Tümü`, `Radyolar`, `Podcastler`, `Bölümler`.
- Sekme seçimi query parametresinde saklanır; geri butonu geçerli sonucu döndürür.
- `Tümü`: en ilgili 6 radyo + 6 podcast + uygunsa bölüm sonuçları; `Tüm radyo sonuçları` aksiyonu.
- `Radyolar`: istasyon kartları, ülke/dil/tür filtreleri, popüler/A–Z, sayfalama.
- `Podcastler`: program kartları, ülke/dil/kategori filtreleri; sonuçlar Apple katalog aramasından veya başka izinli katalogdan.
- `Bölümler`: yalnızca gerçek katalog/indeks sağlayıcıda bulunabiliyorsa sonuç; yoksa boş sonuçla dürüst açıklama. Program başlığı aramasını `bölüm araması` diye göstermeyin.
- Arama metninde Türkçe ı/İ, Rusça Kiril, aksanlı harfler doğru Unicode işlenir.
- Duplicate'leri `stationuuid`, `collectionId`, `enclosure GUID` ile tekilleştir.
- API kaynakları arası tutarsız metadata ile sıralama kapakları bozulmasın.

### 5.3 Arama backend akışı

```text
Kullanıcı yazıyor
   └─ 300 ms debounce + URL-encode + AbortController
       └─ /api/search?q=...&type=all&country=TR
          ├─ radioSearch(q, filters)       -> Radio Browser
          ├─ podcastSearch(q, country)    -> Apple iTunes / izinli katalog
          └─ episodeSearch(q)             -> sadece gerçekten mevcut episode index
              └─ normalize + dedup + rank + total/sayfalama + cache
                  └─ UI: Tümü / Radyo / Podcast / Bölümler
```

### 5.4 Arama ranking [Ö]

- Radyo: istasyon ismi tam eşleşme > isim önek eşleşme > kısmi isim > eşleşen tag/dil/ülke; sonra popülerlik.
- Podcast: tam başlık > başlık öneki > yapımcı > açıklama; sağlayıcının relevance skoruna saygı.
- Kategori/haber/ülke aramasını uygun sonuç moduna yönlendir; sorguyu sahte sabit kartlarla doldurma.
- P0 hedefi: Radyo ve podcast program araması; bölüm başlığı çapraz arama, ancak gerçek indeks yapılabiliyorsa P1.

### 5.5 Örnek kabul senaryoları

1. `BBC` -> gerçekten bulunan radyo istasyonları; yoksa kaynak hatası/boş sonuç açık.
2. `jazz` -> tür ile ilişkili radyolar.
3. `русское радио` -> Kiril sorgu sorunsuz.
4. `trt` -> sonuçlar filtreyle Türkiye'ye daraltılabilir.
5. `The Daily` -> yayıncı ve bölümlerle podcast detayına erişilir.
6. Anlamsız `zzzxxyy123` -> gerçek boş durum, uydurulmuş sonuç yok.
7. Arama yazarken sekme/filtre değiştir -> önceki response yeni sonuçları ezmez.
8. Arama sonucu oynat -> player açılır; farklı rota tıklanır -> ses kesilmez.

---

## 6. TEK SES OYNATICI: AYRINTILI İŞLEYİŞ

### 6.1 Temel tasarım kararı

Uygulama seviyesinde **bir tek media controller / bir aktif HTMLAudioElement** olacak. Radyo ve podcast aynı controller'ı paylaşacak. React sayfa bileşenleri değiştiğinde player mount dışına alınmayacak. Bir `PlayerProvider + usePlayer` / global store (mevcut stackteki eşdeğeri) oluştur.

Önerilen model:

```ts
type MediaKind = 'radio' | 'podcast_episode';
type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'buffering' | 'reconnecting' | 'ended' | 'error';
interface PlayerState {
  kind: MediaKind | null;
  sourceId: string | null;
  title: string;
  subtitle?: string;
  artworkUrl?: string;
  audioUrl?: string;
  stationUUID?: string;
  podcastId?: string;
  episodeId?: string;
  status: PlayerStatus;
  isLive: boolean;
  durationSec: number | null;
  currentTimeSec: number;
  volume: number; // 0..1
  isMuted: boolean;
  playbackRate: number;
  errorCode?: string;
  reconnectAttempt: number;
  sleepTimerEndAt?: number;
}
```

### 6.2 Alt mini player — tüm butonlar

| Buton / kontrol | Radyo modu | Podcast modu |
|---|---|---|
| Kapak + başlık | İstasyon detayına gider | Bölüm/program detayına gider |
| Play | Seçili streami çal | Seçili enclosure sesini çal |
| Pause | Akışı duraklat/durdur | Konumu koruyarak duraklat |
| Stop [opsiyonel] | Çalmayı tamamen kapat | Durdurup konumu tut |
| Previous | Favori/aktif listeye göre önceki radyo | Önceki bölüm, kullanıcı tercihiyle |
| Next | Favori/aktif listeye göre sonraki radyo | Sonraki bölüm, yalnızca gerçek sıraya göre |
| Kalp | Favoriye ekle/çıkar | Bölümü kaydet veya programı takip et: ikisini karıştırma |
| Ses seviyesi | 0–100, mute | 0–100, mute |
| İlerleme çubuğu | **YOK**, canlı yayında seek yok | Kaydırılabilir; `duration` ve `timeupdate` |
| LIVE | Canlı kırmızı rozet | Gösterilmez |
| Hız | Normal, radyo için hız ayarı yok | 0.8×–2× |
| 15 sn geri / 30 sn ileri | **YOK** | Gerçek seek |
| Sleep timer | Aç/kapat | Aç/kapat / bölüm bitince dur |
| Big screen / full player | Aç | Aç |
| Close / collapse | miniye küçült veya sesi durdur, seçilen davranış net | aynı |
| Hata / retry | Tekrar bağlan | Enclosure tekrar dene |

### 6.3 Player durum makinesi

```text
IDLE --play--> LOADING --canplay/playing--> PLAYING
                        \--timeout/error--> RECONNECTING [sadece radyo]
PLAYING --pause--> PAUSED --play--> LOADING/PLAYING
PLAYING --stalled--> BUFFERING --recovered--> PLAYING
BUFFERING/RECONNECTING --max retries--> ERROR
PLAYING [podcast] --ended--> ENDED --next if enabled--> LOADING
ANY --switch source--> reset old listeners/timers -> LOADING(new source)
ANY --stop--> IDLE
```

**Zorunlu korumalar:**
- Tek `<audio>` instance; source değişiminde eski fetch/event geri dönüşleri yeni source'u ezmesin (`requestId`, cleanup).
- `play()` Promise reje edilirse autoplay uyarısı göster; kullanıcıya tekrar dokunma imkanı ver.
- `audio.error`, `waiting`, `stalled`, `canplay`, `playing`, `pause`, `ended`, `timeupdate`, `loadedmetadata`, `durationchange` uygun şekilde ele alınır.
- HLS `.m3u8`: Safari'de native HLS; diğer desteklenen tarayıcılarda gerçekten gerekli ise `hls.js` adapter. Kütüphane/MediaSource desteklenmiyorsa açık hata. MP3/AAC için native audio.
- HTTP yayınlarını HTTPS web sitesinden oynatmaya çalışma; mixed-content engeli. `url_resolved` HTTPS ise tercih et.
- Audio stream'i rastgele kendi sunucundan proxy'leyip bütün yayınları yeniden yayınlama (maliyet, lisans ve bant genişliği riski).
- `MediaSession` API ile başlık, artwork ve medya tuşları mümkünse entegre et; desteklenmeyen tarayıcıda sessizce fallback.
- `navigator.onLine` kullan ama tek başına erişilebilirliğin kanıtı sayma.

### 6.4 Radyo kopması ve geri bağlanma

Referanstaki davranış: en fazla 6 deneme, aralık 1–30 saniye [D]. Bizim için önerilen `[1, 2, 4, 8, 16, 30]` saniyelik liste [Ö]:

1. Sorun `stream`, `network`, `unsupported` olarak ayrılır.
2. Çevrimdışıysa `İnternet bağlantısı bekleniyor`; kör retry döngüsü çalışmaz.
3. Çevrimiçiyse yeniden bağlan; UI `Yeniden bağlanılıyor (3/6)`.
4. 6 deneme sonunda `Yayın şu anda açılamıyor` + `Tekrar Dene` + `Benzer Radyolar`.
5. Kullanıcı başka istasyonu seçerse eski retry hemen iptal edilir.
6. Yeniden bağlandıktan sonra geçmişe tekrar tekrar aynı istasyonu ekleme.

### 6.5 Podcast seek ve konum kaydı

- Bölüm audio metadata `duration` sağlanmıyorsa ilerlemeyi 00:00 / bilinmiyor olarak göster, sahte süre oluşturma.
- Seek `Math.max(0, Math.min(duration, target))` ile sınırlandır.
- Her program/bölümün GUID/enclosure URL ile sabit kimliği; başlıklar değişebileceği için title ID olamaz.
- Resume öncesi önceki konumu kullanıcıya göster (`Kaldığın yerden devam et — 12:34`).
- Dinleme ilerlemesi localStorage/IndexedDB içine yazılır.
- Bu bölümün süresi değişmişse kayıtlı konumu düzelt; feed bölümü silinmişse uygulama çökmemeli.

### 6.6 Sleep timer

- Hazır süreler: 15, 30, 45, 60, 90, 120 dakika; özel: 1–480 dakika.
- Podcastte `Bölüm bitince` seçeneği.
- `Başlat`, `Durdur`, `15 dk ekle`, sayaç görünümü.
- Süre sonunda son 30 saniyede kademeli ses kıs; normal volume ayarını değiştirme, etkin ses katsayısını düşür.
- Timer bittiğinde playback pause; kullanıcı sonradan başlatırsa eski ses seviyesine dön.
- Sayfa değişiminde zamanlayıcı kaybolmaz; yenileme sonrasında tarayıcı kısıtlarına göre güvenli restore; sessiz otomatik oynatma vaadi yok.

### 6.7 Big Screen

- Büyük saat (12/24 saat tercihi), kapak, yayın adı, canlı/bölüm durumu, play/pause, ses ve çıkış.
- `Fullscreen API` kullanıcı jestiyle; API desteklenmezse ekranı dolduran modal.
- `Wake Lock API` yalnızca mevcut ve kullanıcı izinliyse; ekranı sürekli açık tutma garantisi vermez.
- Klavye `Escape` çıkış; ekran okuyucuya anlamlı etiket.

### 6.8 Klavye kısayolları

- `Space` -> Play / Pause (input odağında değilse).
- `M` -> Mute / Unmute.
- `/` -> Aramaya odaklan.
- `←` ve `→` -> radyo modunda önceki/sonraki istasyon; podcast modunda **bizim tercihimiz** 15sn geri / 30sn ileri (kullanıcıya yardım ekranında belirt).
- `Escape` -> açık modalı kapat / Big Screen'den çık.
- Kontroller input içindeyken kısayollar metin yazmayı bozamaz.

---

## 7. GERÇEK VERİ KAYNAĞI: RADYO BROWSER API

**Referans ve resmi dokümanlar:**
- https://www.radio-browser.info/
- https://api.radio-browser.info/
- https://docs.radio-browser.info/

**Kritik kurallar:**
- `stationuuid` kimlik olarak kullan; eski numeric `id` kullanma.
- Ülke için ISO `countrycode` kullan, serbest metin `country` alanını API filtre anahtarı olarak tercih etme.
- `url_resolved` mevcutsa kullan; HTTPS değilse uygun alternatif/erişilemiyor durumu.
- `lastcheckok === 1` ve mümkünse `url_resolved` HTTPS filtrele; bazı canlı yayınlar yine de çalışmayabilir.
- `clickcount` ve `votes` popülerlik göstergeleri; sahte kişi sayısı veya sahte canlı dinleyici sayısı üretme.
- Servis birçok aynadan oluşur; tek domain hardcode edilip oraya mahkum edilmez. Sunucu keşfi + fallback + kısa timeout.
- Sunucu tarafı isteklerde açıklayıcı `User-Agent: RadioCast/1.0` gönder.
- Kullanıcı gerçekten radyo oynattığında varsa `/json/url/{stationuuid}` API'siyle dinleme tıklamasını kaydet; her render'da gönderme.
- Popüler, ülke, dil ve tür cache TTL'leri ayrı olsun; anahtar query+filter+page.

### 7.1 Örnek istek kalıpları

```http
GET https://de1.api.radio-browser.info/json/stations/search?name=rock&hidebroken=true&limit=30&offset=0&order=clickcount&reverse=true
GET https://de1.api.radio-browser.info/json/stations/search?countrycode=TR&hidebroken=true&limit=30&offset=0&order=clickcount&reverse=true
GET https://de1.api.radio-browser.info/json/stations/search?tag=jazz&hidebroken=true&limit=30&offset=0&order=clickcount&reverse=true
GET https://de1.api.radio-browser.info/json/stations/search?language=Russian&hidebroken=true&limit=30&offset=0
GET https://de1.api.radio-browser.info/json/stations/byuuid/{stationuuid}
GET https://de1.api.radio-browser.info/json/countries
GET https://de1.api.radio-browser.info/json/languages
GET https://de1.api.radio-browser.info/json/tags
```

`de1` yalnızca API'nin verdiği belgelenmiş örnek aynadır; bunu tek sabit production host kabul etme. Bütün URL parametrelerini `URLSearchParams` ile güvenli encode et. Gerçek backend mirror keşfini yapamazsa geçici birden fazla belgeli HTTPS mirror ile adapter ve health-check kur; kalıcı kodda tek mirror dependency bırakma.

### 7.2 Normalize edilmiş radyo modeli

```ts
interface RadioStation {
  id: string; // stationuuid
  name: string;
  streamUrl: string; // url_resolved, HTTPS ve validate edilmiş
  homepageUrl?: string;
  faviconUrl?: string;
  countryCode?: string;
  countryName?: string;
  state?: string;
  languages: string[];
  tags: string[];
  codec?: string;
  bitrateKbps?: number;
  clickCount?: number;
  votes?: number;
  lastCheckOk?: boolean;
  isHttps: boolean;
}
```

### 7.3 Fallback ve çalışma güvencesi

- İstasyon kataloğu API erişilmezse uygulama çökmez; daha önce cache'e alınmış geçerli istasyonlar gösterilir (TTL bayat ise uyarı).
- İsteğe bağlı, doğrulanmış ve hak sahibinin izin verdiği küçük JSON seed kataloğu; örnekler *gerçekten oynatılabilir* olmalı ve yayın URL'leri periyodik kontrol edilmeli.
- Radio Browser değişken kalite taşır; her istasyonu frontendde tek tek GET ederek kitlesel tarama yapma.
- Kullanıcının favorisi API'de kaybolduysa favori korunur; detay `Kaynakta artık bulunamıyor`.
- İstasyon kalite etiketlerini gerçekten verilen `codec/bitrate` ile göster.

---

## 8. PODCAST KATALOĞU, ARAMA, RSS VE BÖLÜMLER

**Resmi/veri kaynakları:**
- Apple iTunes Search API: https://performance-partners.apple.com/search-api
- Apple Podcasts Charts açıklaması: https://podcasters.apple.com/support/3146-apple-podcasts-charts
- Podcastlerin **yayıncı RSS kaynakları** (kendi ses ve meta verilerinin gerçek kaynağı).

### 8.1 Podcast arama

Örnek Apple arama URL'si:

```http
GET https://itunes.apple.com/search?term=history&media=podcast&entity=podcast&country=TR&limit=25
GET https://itunes.apple.com/lookup?id={collectionId}&entity=podcast
```

- Aramayı `term`, `country`, `limit` ile yap, sonuçlardan `collectionId`, `collectionName`, `artistName`, `artworkUrl600`, `feedUrl`, `primaryGenreName`, `trackCount` gibi **gerçek dönen alanları** normalize et.
- Apple iTunes API resmi açıklamasına göre yaklaşık 20 çağrı/dk sınırı vardır (değişebilir); yüksek trafik için server cache + throttling + 429 handling.
- Apple'ın API/promosyon, artwork ve marka kullanım koşullarına uy; otomatik olarak tüm kapakları indirip sınırsız kopyalama yapma.
- Başka kaynak kullanılacaksa yasal izinlerini, API limitlerini ve SLA'sını doğrula.
- TuneWake'in kendi özel podcast kataloğunu doğrudan kullanmaya kalkma; bu bizim servisimiz değil. [Ö] Bizim normalleştirme/cache katmanımız olacak.
- `The Daily`, `Joe Rogan`, Kiril başlıklı bir Rusça podcast araması gerçek sonuç döndürüyorsa UI tutarlı görünmeli. Bölgesel içerik yoksa dürüstçe göster.

### 8.2 Podcast charts ve kategoriler

- Podcast `Top charts` sıralaması tercihen izinli/resmi Apple chart kaynağından (mevcut erişim ve kullanım koşulları doğrulansın), kullanılabilir değilse sağlayıcının izinli popüler sonuç endpoint'i ile `Popüler podcastler` adı kullan; **resmi chart sırası** gibi sunma.
- Her listede `Kaynak`, `Ülke`, `Son yenileme` bilgisini metadata olarak tut.
- Önerilen kategoriler: News, Society & Culture, Comedy, True Crime, History, Business, Science, Technology, Education, Health & Fitness, Sports, Arts, TV & Film, Music, Kids & Family, Fiction, Leisure, Religion & Spirituality.
- Kategori ID ve provider ID eşleştirmesini ayrı config'te tut; geçersiz kategori kodları sessiz boş sayfa üretmesin.

### 8.3 RSS beslemesi (podcast ana gerçeklik kaynağı)

Yayıncı feed'i üzerinden:

```text
RSS <channel>: title, description, language, image, author,
  itunes:category, link, lastBuildDate
RSS <item>: guid, title, description/content:encoded,
  pubDate, itunes:duration, enclosure.url, enclosure.type,
  itunes:episode, itunes:season, explicit, image
```

**Parsing kuralları:**
- XML feed'i sunucu tarafında parse et (web tarayıcısı CORS ve RSS sunucuları yüzünden doğrudan fetch'te başarısız olabilir).
- `fast-xml-parser` veya sağlam alternatif + güvenli XML ayarları; DTD/external entity/XXE kapalı.
- Yalnızca HTTP(S) URL kabul et, production'da HTTPS tercih; özel IP, loopback, link-local, cloud metadata ve DNS rebinding'e karşı **SSRF koruması**.
- Redirect sayısı, timeout, maksimum response boyutu, XML entity expansion, feed item sayısı sınırla.
- Feed URL'si secret token içerebilir: loglarda tokenları maskele, başkalarına açık cache veya paylaşım linklerine dökme.
- HTML show notes sanitizer; `dangerouslySetInnerHTML` ile güvensiz HTML yazma.
- `enclosure` boş veya yanlış MIME ise oynatma devre dışı ve açıklamalı hata.
- Kimi feedlerde süre yok, başlık çok uzun, resim boş, timestamp geçersiz olabilir; UI dayanıklı olmalı.
- Cache (örn. 30–120 dakika), koşullu GET (`ETag` / `Last-Modified`) mümkünse.

### 8.4 Normalize veri modelleri

```ts
interface PodcastShow {
  id: string;               // Apple collectionId veya hash(feedUrl)
  title: string;
  author?: string;
  description?: string;
  artworkUrl?: string;
  feedUrl?: string;
  externalPageUrl?: string;
  language?: string;
  categoryIds: string[];
  episodeCount?: number;
  latestEpisodeAt?: string;
  isExplicit?: boolean;
  source: 'apple' | 'rss' | 'other';
}
interface PodcastEpisode {
  id: string;                // stable GUID; fallback hash(feed+enclosure+pubDate)
  podcastId: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  durationSec?: number;
  enclosureUrl?: string;
  enclosureMime?: string;
  artworkUrl?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  isExplicit?: boolean;
}
```

### 8.5 Takip ve devam etme

- `Takip Et` -> o program `followingPodcasts` içine; güncel RSS kontrolü.
- Kullanıcı takip ettiği programın sayfasında son bölümleri ve yeni bölümleri görür.
- `Yeni bölümler` işareti feed'deki GUID ve kullanıcı `lastSeenAt/played` verileriyle belirlenir.
- Podcast liste/arama kartındaki takip butonu podcast detayı olmadan da işlemeli.
- Kaldığı yerden devam etme `episodeId -> seconds, updatedAt, completedAt`.
- Private/premium feed desteği ileride sunulacaksa token güvenliği ve kullanıcı gizliliği ayrıca tasarlanmalı; P0'da public RSS.

---

## 9. BACKEND / API KATMANI [Ö]

Google AI Studio Build mode mevcut projesi React + Node.js ise bununla uyumlu ilerle. Proje Next.js, Vite veya başka framework kullanıyorsa baştan stack değiştirmek yerine adapte ol.

Önerilen servis katmanları:

```text
React UI / Router / Global Player Store
        │
        ├── /api/radio/...      -> RadioBrowserService (mirror, cache, normalize)
        ├── /api/podcasts/...   -> PodcastCatalogService (Apple search, cache)
        ├── /api/feeds/...      -> FeedFetcher (safe SSRF, parsing, cache)
        ├── /api/search        -> radio + podcasts (+ true episode index)
        └── /api/metadata      -> ülke, kategori, tag mapping
                   │
                 Cache
        localStorage / IndexedDB (user favorites & progress)
        Hosted audio: CLIENT -> DIRECT BROADCASTER/PUBLISHER
```

### 9.1 Önerilen internal endpoint'ler

| Endpoint | Parametre | Normalleştirilmiş çıktı |
|---|---|---|
| `GET /api/radio/popular` | `country`, `limit`, `offset` | `RadioStation[]` |
| `GET /api/radio/search` | `q`, `country`, `language`, `genre`, `sort`, `page` | items + pagination |
| `GET /api/radio/:uuid` | uuid | station + related |
| `POST /api/radio/:uuid/click` | gerçek play jesti | başarı (opsiyonel) |
| `GET /api/radio/countries` | - | country codes + display names |
| `GET /api/radio/genres` | - | türler/tags |
| `GET /api/radio/languages` | - | diller |
| `GET /api/podcasts/search` | `q`, `country`, `limit`, `page` | `PodcastShow[]` |
| `GET /api/podcasts/charts` | `country`, `category` | source + fetchedAt + shows |
| `GET /api/podcasts/:id` | podcast ID | show + episodes |
| `POST /api/podcasts/import-rss` | `feedUrl` | show + episodes (server doğrular) |
| `GET /api/podcasts/:id/episodes` | `page`, `filter`, `sort` | paged episodes |
| `GET /api/search` | `q`, `type`, `country`, filtre | mixed normalized result |
| `GET /api/health` | - | upstream health + app version, sır içermez |

Frontend endpoint'leri tek adapter'dan kullan, doğrudan her sayfada farklı kaynaklardan raw veri çekme. Gerekli değilse API'nin bir kısmını doğrudan clienttan okuma optimize edilebilir, ancak RSS ve cross-provider search için güvenli backend önemlidir.

### 9.2 Önbellek, hatalar, güvenlik

- API isteklerine `AbortController`, timeout ve kısa kontrollü retry; exponential backoff.
- Sağlayıcı başarısız olursa `503` normalize hata koduyla döndür; kullanıcıya Türkçe açıklama.
- Memory cache veya uygun persistent cache, TTL ve maksimum boyut; rate-limit'e saygılı ol.
- Arama sorgu loglarında kişisel bilgi, URL tokenı, IP gereksiz tutulmasın.
- Public API response'una private feed URL tokenlarını, ortam sırlarını veya kişisel ayarları sızdırma.
- SSRF koruması: URL doğrulama + DNS çözümlemesinden sonra private/reserved IP bloklama + her redirect'te yeniden kontrol; mümkünse egress ağ politikası.
- XSS: RSS açıklamaları sanitize; image URL ve external link protokollerini doğrula.
- Güvenlik başlıkları, CSP tasarımı ve `rel="noopener noreferrer"`.
- Başkalarının sesini yeniden yayınlamak, kaydetmek ve lisanssız indirmek yok.
- Hata raporları/kayıtları kullanıcının isteğine ve gizliliğe uygun.

---

## 10. UYGULAMA STATE VE KALICI VERİ

Önerilen storage yapısı:

```ts
interface UserPreferences {
  locale: 'tr' | 'en' | 'ru';
  countryCode: string;
  theme: 'system' | 'light' | 'dark';
  radioView: 'grid' | 'list';
  defaultVolume: number;
  podcastPlaybackRate: number;
  podcastAutoNext: boolean;
  clock24h: boolean;
}
interface SavedLibrary {
  schemaVersion: 1;
  favoriteStationIds: string[];
  followedPodcasts: Array<{ id: string; feedUrl?: string; addedAt: string }>;
  favoriteEpisodeIds: string[];
  radioGroups: Array<{ id: string; name: string; stationIds: string[] }>;
  history: Array<{ kind: 'radio' | 'podcast_episode'; id: string; playedAt: string }>;
  progress: Record<string, { seconds: number; completed: boolean; updatedAt: string }>;
}
```

- Tercihler `localStorage`; daha büyük feed cache/episode progress `IndexedDB` uygun olabilir.
- `schemaVersion` ile migration; bozuk JSON okunursa uygulama çökmez, defaults ve kurtarma.
- Sekmeler arasında tercih/favori senkronizasyonu için `storage` event/BroadcastChannel (destek varsa).
- Hesapsız kullanımda cihazlar arası otomatik senkronizasyon yok; şeffaf açıklama.
- İsteğe bağlı `Favorilerimi dışa aktar (JSON)` ve `İçe aktar` [P2]; veri kaybını azaltır.
- Kullanıcının mevcut AI Studio projesinde kaydedilmiş veriler varsa yeni şemaya geçişte **silinmez**.

---

## 11. ÇOK DİL, ERİŞİLEBİLİRLİK, SEO, PWA

### 11.1 Çok dil

- İlk etap **Türkçe (varsayılan), İngilizce, Rusça**.
- `i18n` anahtarları dil dosyalarında; buton metni, aria-label, loading/empty/error, kategori isimleri çevrilir.
- Radyo/podcastlerin orijinal başlıkları çevrilmez; kullanıcı tarafından yazılmış metin aynen kalır.
- `Intl.DateTimeFormat`, `Intl.NumberFormat`, yerel saat formatı.
- Rusça Kiril arama, Türkçe ı/İ case mapping ve Unicode normalize testleri.
- Dil değiştirmek ses oynatmayı durdurmaz.

### 11.2 Erişilebilirlik

- WCAG 2.2 AA hedefi; klavyeyle tüm fonksiyonlar kullanılabilir.
- Input label, canlı yayın durumu `aria-live` kontrollü; gereksiz her saniye anons yok.
- Seek bar ve volume slider klavyeden ayarlanır, sayısal değer ekran okuyucuya okunur.
- Modal focus trap ve açıldığı butona geri odak.
- Metin kontrastı, 200% zoom, reduced motion, 44px dokunma hedefleri.
- Görseller alt metin; dekoratif ikon `aria-hidden`.
- Görsel bağımsız durum iletimi: favori dolu/boş kalp sadece renkle anlatılmaz (`aria-pressed`).

### 11.3 SEO ve paylaşım

- Halka açık station/podcast detay sayfalarında okunur başlık, benzersiz açıklama, canonical URL, OpenGraph ve metadata.
- Kategoriler için sadece gerçek içerik üreten index sayfaları; boş/search URL'lerini indekslemeyi dikkatle yönet.
- Sitede yüz binlerce otomatik düşük değerli sayfa basma; örnek kalite odaklı detaylar.
- JSON-LD: doğrulanmış uygun `RadioStation`/`PodcastSeries` schema türlerini ve desteklenen alanları kullan; doğrulanmamış reyting uydurma.
- Navigasyonda breadcrumb, `rel=canonical`; bulunmayan ID'de gerçek 404.

### 11.4 PWA

- Manifest, uygun ikonlar, install prompt yalnızca browser destekliyorsa.
- Service worker app shell/cache; ses streamini offline çalıyor gibi gösterme.
- Offline modunda daha önce cache'lenen metadata/favori gösterilebilir, **radyo internet ister**.
- Web PWA veya açık sekme, native Android exact alarm yerine geçmez.

---

## 12. HATA/DURUM MATRİSİ — HER ŞEY TIKLANDIĞINDA NE OLACAK?

| Senaryo | Beklenen sonuç |
|---|---|
| Radyo bulunamadı | "İstasyon bulunamadı" + filtreleri temizle |
| Podcast bulunamadı | "Podcast bulunamadı" + yeniden ara / RSS ekle |
| Radio Browser 503 | cache varsa uyarılı göster; yoksa retry ve anlaşılır hata |
| Apple rate limit 429 | retry-after/backoff, cache, boş fake sonuç yok |
| RSS bozuk XML | "RSS beslemesi okunamadı" + ayrıntı linki |
| RSS URL private IP | sunucu isteği engeller, kullanıcıya geçersiz URL mesajı |
| RSS erişim 403 | "Yayıncı erişime izin vermiyor" |
| RSS enclosure yok | bölüm başlığı var ama play disabled, nedeni açık |
| Radyo HTTP mixed content | HTTPS alternatif varsa kullan, yoksa "Bu yayın güvenli bağlantıda açılmıyor" |
| HLS browser desteklemiyor | adapter varsa dene; yoksa uyumlu format/alternatif öner |
| Stream drop | 6 kontrollü reconnect, görünür sayaç, manuel retry |
| İnternet kesildi | offline durum, bağlantı gelince kontrollü devam |
| Oynatma autoplay blocked | "Oynatmak için dokunun" mesajı |
| Audio codec desteklenmiyor | uygun açıklama, başka istasyon seç |
| Yeni medyaya geçildi | eski ses tamamen durur; tek aktif audio |
| Sayfa değişti | player sesi kesilmez |
| Sekme yenilendi | favoriler/ilerleme korunur; otomatik playback garanti edilmez |
| Favori eklendi | tüm görünümlerde kalp güncellenir |
| Favori silindi | anında UI ve storage güncellenir |
| Geçmiş temizlendi | sadece geçmiş; favoriler korunur |
| Podcast episode bitti | tamamlandı işaretle; autoNext ayarına saygı |
| Kullanıcı dil değiştirdi | UI dil değiştirir, playback sürer |
| Kullanıcı sleep timer koydu | sayaç, fadeout, normal ses değerini koruma |
| Theme değişti | focus, renk, ikon kontrastı korunur |
| Mobil ekran küçüldü | player ve alt menü çakışmaz |
| Kapak görseli bozuldu | harfli/ikonlu fallback, layout kaymaz |
| Ana API kesildi | kullanıcı boş beyaz sayfa değil, açık durum ekranı görür |

---

## 13. UYGULAMA AŞAMALARI — GOOGLE AI STUDIO MEVCUT PROJE DÖNÜŞÜMÜ

### FAZ 0 — Ön inceleme / mevcut projeyi koru (zorunlu)

1. Dosya ağacını oku: package.json, framework, routes, API/client, stiller, player, state, mevcut veriler.
2. Çalışan özellikleri ve bozuk özellikleri listele; kritik kullanıcı verilerini ve dosyalarını yedekle.
3. Mevcut uygulamanın stack'ini gereksiz yere değiştirme; kabaca bağımlılık uyumluluğu incele.
4. `PROJECT_AUDIT.md` (proje içinde) oluştur: mevcut ekranlar, tekrar kullanılacak bileşenler, plan.
5. `MIGRATION_LOG.md` ile her faz değişikliklerini not et.
6. Projenin preview/build komutunu çalıştır; ilk durumu belirle.

**Kabul:** Önceki çalışan özellikler bozulmadan referans dönüşümüne başlanır.

### FAZ 1 — Güçlü iskelet / gerçek radyo

- Responsive shell: sidebar, topbar, global search, Home, Radio, Favorites, History, mini player.
- Radio Browser service + normalizasyon + mirror/fallback.
- Popüler, Türkiye/Rusya/ABD, tür, dil, filtre, sıralama, gerçek station detail.
- Play/Pause, volume/mute, current source, heart, history, player page persistence.
- Stream error / reconnect / loading; mobil çalışma.
- Tüm rota linkleri ve butonları işlevli.

**Kabul:** Türkiye'den popüler bir gerçek istasyon arandı, açıldı, çaldı, favoriye alındı; kategoriye geçince çalmaya devam etti; başarısız stream kontrollü hata verdi.

### FAZ 2 — Podcast, RSS ve entegre arama

- Podcast search: Apple iTunes ve gerekiyorsa izinli alternatif dizin.
- Podcast keşif, kategori, detay, episode list, gerçek RSS feed parsing.
- Gerçek episode player: seek, speed, 15 sn geri, 30 sn ileri, progress/resume.
- Follow/unfollow, podcast library, son bölüm, filtre ve sıralama.
- Global `/search` tümü/radyo/podcast sonuçları; bölüm sekmesi ancak gerçek index varsa.
- RSS ile manuel ekleme, feed parser hata mesajları.

**Kabul:** Gerçek podcast bulunur, 3 farklı bölümü listelenir, biri oynatılır, 1.5x çalışır, sekme değişiminde audio sürer, pause+refresh sonrası kayıtlı konumu geri getirir.

### FAZ 3 — Gelişmiş oynatıcı, tasarım, erişilebilirlik

- Sleep timer, 30 sn fade-out, 15dk uzatma, Big Screen ve kısayollar.
- Koyu/açık tema, TR/EN/RU, responsive mikro-etkileşimler.
- Grup bazlı favoriler, custom sıralama.
- Skeleton/empty/error states tüm ekranlarda.
- MediaSession, PWA, erişilebilirlik, SEO sayfaları (mevcut stack uygunsa).
- Performans, bundle ve istek optimizasyonu.

**Kabul:** Desktop 1440, tablet 768, mobil 390 ve dar mobil 320 genişlikte kullanılabilir; stream kopması/geri gelmesi, 6 retry, HLS desteği, timer, klavye senaryoları test edilir.

### FAZ 4 — Üretim güvenliği ve son kabul

- Servis key/secret sızıntısı yok; RSS proxy SSRF güvenli; rate limit ve cache.
- Hata logları, hukuki sayfalar, içerik kaldırma/report workflow.
- Playwright/Vitest veya mevcut test sistemiyle smoke/integration/E2E.
- Gerçek API ile örnek dataset doğrulama; demo/sabit listeyi production ekranı gibi sunma.
- Deploy config ve mümkünse staging URL'de manuel test.
- `README.md`, `FEATURE_CHECKLIST.md`, `KNOWN_LIMITATIONS.md` ve test sonucu üret.

**Kabul:** Critic/P0 0 bug; bütün zorunlu butonlar çalışır; veri gerçek ve kaynaklı; bozuk stream uygulamayı çökertmez; güvenlik testleri geçer.

---

## 14. TAM KABUL TESTİ / QA CHECKLIST

### A. Navigasyon
- [ ] Logo ana sayfaya gider; player devam eder.
- [ ] Sidebar ve mobil tab/nav doğru sayfayı açar.
- [ ] Tarayıcı geri/ileri doğru çalışır.
- [ ] Direkt URL ile station/podcast detaya gidilir, refresh çalışır.
- [ ] Mobil hamburger drawer açılır/kapanır, modal focus düzgündür.

### B. Radyo
- [ ] Radio Browser canlı API'den 20+ farklı radyo dönüyor.
- [ ] TR, RU, US ülke filtreleri çalışıyor.
- [ ] Pop, Jazz, News, Rock tür filtreleri çalışıyor.
- [ ] Dil filtreleri çalışıyor, Türkçe/Rusça test edildi.
- [ ] A–Z / Popüler sıralama gerçekten sıralıyor.
- [ ] Grid/list görünümü gerçekten değişiyor.
- [ ] İstasyon kartına tık detay açıyor; Play anında çalıyor.
- [ ] Favorite kalbi ekle/çıkar ve refresh sonrası korunuyor.
- [ ] Favorilerdeki play çalışıyor.
- [ ] Tek bir aktif audio var; aynı anda iki yayın yok.
- [ ] Stream kesilince durum, retry ve hata mesajı çalışıyor.
- [ ] HTTPS/mixed content/hls/codec hata senaryoları uygulanmış.

### C. Podcast
- [ ] Podcast araması gerçek en az bir program buluyor.
- [ ] Program detayı başlık, yayıncı, kapak, RSS gösteriyor.
- [ ] Bölüm listesi gerçek RSS öğelerinden geliyor.
- [ ] Bölüm Play/Pause çalışıyor.
- [ ] Seek ve 15sn geri/30sn ileri çalışıyor.
- [ ] Hız 0.8x, 1x, 1.5x, 2x çalışıyor.
- [ ] Progress refresh sonrası saklanıyor.
- [ ] Takip et/kaldır çalışıyor.
- [ ] Dinlenmiş/dinlenmemiş filtre doğru.
- [ ] RSS manuel ekle için geçerli/hatalı feed test edildi.
- [ ] RSS XSS ve SSRF koruması test edildi.

### D. Arama
- [ ] Global input tüm sayfalarda bulunuyor.
- [ ] Enter, search icon ve search suggestion aynı route mantığına uyuyor.
- [ ] Radyo ve podcast sonuçları doğru sekmelerde.
- [ ] `q`, `type`, filtreler URL'de korunuyor.
- [ ] `BBC`, `jazz`, `русское радио`, `trt`, `The Daily` denendi.
- [ ] Boş ve 429/503/timeout durumları ayrı.
- [ ] Sorgu değişince stale request UI'ı bozmuyor.
- [ ] Sonuç kartının play, favorite/follow, detail butonları gerçekten işliyor.

### E. Oynatıcı
- [ ] Player navigasyonda remount olmuyor.
- [ ] Play, Pause, Mute, Volume ve stop/close tutarlı.
- [ ] Radio LIVE durumunda seek kontrolü yok.
- [ ] Podcastte doğru duration ve currentTime var.
- [ ] Sleep timer başlat/iptal/uzat/fade-out çalışıyor.
- [ ] Big Screen açılıyor, Escape çıkıyor.
- [ ] Klavye kısayolları input yazımını bozmuyor.
- [ ] MediaSession varsa uygun metadata/action; yoksa fallback.
- [ ] Bozuk logo/audio URL çökme yaratmıyor.

### F. Responsive/performans
- [ ] 320, 390, 768, 1024, 1440 genişlikleri incelendi.
- [ ] Player mobil bottom nav ile çakışmıyor.
- [ ] Liste sonsuz sayıda DOM düğümüyle donmuyor.
- [ ] Lazy image, debounce, request caching çalışıyor.
- [ ] Lighthouse/performance temel uyarıları ele alındı.
- [ ] Erişilebilirlik keyboard/tab/screenreader kontrolleri yapıldı.

### G. Veri, güvenlik ve belgeler
- [ ] Başka sitenin marka/logo/kod kopyası yok.
- [ ] Ücretli/özel içerik için izinsiz medya erişimi yok.
- [ ] Secret/API token client bundle'da yok.
- [ ] Kullanıcı verileri mevcut projeden güvenli şekilde taşındı.
- [ ] Uydurma podcast/istasyon/play count/review yok.
- [ ] Demo API hataları prod sürümde sahte başarılı cevaplarla örtülmüyor.
- [ ] Readme, sınırlamalar ve QA raporu oluşturuldu.

---

## 15. GOOGLE AI STUDIO İÇİN DOĞRUDAN ÇALIŞTIRMA KOMUTU

Aşağıdaki talimatı mevcut AI Studio projesindeki sohbet alanında **bu dosyayı ekledikten sonra** gönder:

> **Projeyi dönüştürme görevi:** Eklediğim `TUNEWAKE_RADYO_PODCAST_GOOGLE_AI_STUDIO_MASTER_SPEC.md` dosyasını baştan sona oku ve bunu bağlayıcı ürün/teknik/QA şartnamesi olarak uygula. Referans deneyim `https://www.tunewake.com/` ve `https://www.tunewake.com/listen/`: radyo + podcast + arama + filtreler + detay + tek global player + favoriler + geçmiş + RSS + podcast bölüm oynatma. Referansın marka ve özgün kodunu kopyalama; işlev ve bilgi mimarisini örnek al. **Mevcut projemin kodunu incele ve koru; hiçbir çalışan fonksiyonu silme.** Önce mevcut dosya ağacını, framework'ü ve riskleri değerlendir, `PROJECT_AUDIT.md` oluştur. Sonra bu belgedeki Faz 1'den başlayarak gerçek çalışan özellikleri uygula; Faz 2, 3, 4'e ilerle. Sahte içerik, yalnızca görsel kartlar, çalışmayan butonlar, geçici mock veri, `TODO` ile bırakılan ana özellikler veya başarı varsayımı istemiyorum. Radyo verisi Radio Browser API; podcast arama Apple iTunes Search API veya izinli alternatif; bölüm listesi yayıncı RSS'i olmalı. Güvenli backend ile RSS çek, tek ortak HTMLAudioElement kullan. Her faz sonunda build/test çalıştır, neyi gerçekten yaptığını ve neyin eksik kaldığını raporla. Alt alta çok büyük tek dosya yerine maintainable bileşenler yaz. Proje kodunu mevcut yapıya uyumlu değiştir; bozulma varsa düzelt. Öncelik: gerçekten çalışan radyo ve podcast araması + oynatma, sonra görsel mükemmellik. Şartnamedeki doğrulanmış ve önerilen özellikleri karıştırma; dokümandaki limitleri koru. Varsayılan dil Türkçe, ikinci İngilizce, üçüncü Rusça. Gereksiz yeni üyelik sistemi, ödeme ve tarayıcı alarmı ekleme. **Hemen mevcut projeyi denetleyerek işe başla; yalnızca plan yazıp uygulamayı bırakma.**

### 15.1 İlk uygulamadan sonra ikinci komut — test ve onarım

> Şimdi `FEATURE_CHECKLIST.md` oluşturarak bu şartnamedeki tüm ekranları, kontrolleri, butonları ve API akışlarını tek tek test et. Üstteki arama alanına `jazz`, `TRT`, `русское радио`, `The Daily` gir; Radyolar/Podcastler arama sonuçlarını kontrol et. Gerçek radyo ve gerçek podcast bölümü çal, birinden diğerine geç, rota değiştir, favori/takip kaydet, sayfa yenile, bozuk stream ve bozuk RSS simüle et, reconnect ve timerı dene. Sadece hata listesi verme: kodu düzelt, testleri yeniden çalıştır. Hâlâ test edemediğin şeyleri `KNOWN_LIMITATIONS.md` içinde dürüstçe belirt. Sahte başarılı ekran gösterme.

### 15.2 AI Studio ajanına verilecek öncelik kuralı

Birden çok faz tek prompt ile tam bitirilemiyorsa sırayla uygula: **önce FAZ 0 + FAZ 1**, sonra **FAZ 2**, sonra **FAZ 3 + FAZ 4**. Her fazın kabul testini geçmeden sonraki aşamanın görsel detaylarına takılma. Küçük, geri alınabilir değişiklikler yap; her aşamada build'i çalıştır.

---

## 16. REFERANS KARŞILAŞTIRMASI VE ÖNEMLİ AYRIMLAR

| Konu | TuneWake'ten doğrulanan | Bizim üründe karar |
|---|---|---|
| Web alarmı | Yok; alarm native mobilde | Webe sahte alarm ekleme |
| Radyo kaynağı | Radio Browser | Aynı açık katalogdan meşru API kullanım |
| Podcast kaynağı | Apple charts + yapımcı RSS, özel katalog/fyyd fallback | Apple search + RSS; kendi server-side adapter/cache |
| Arama | Webde istasyon, uygulamada podcast katalog araması | Tek global radyo+podcast araması, tam sonuç sayfası |
| Ses kaynağı | Yayıncı sunucusundan | Doğrudan audio; kendi sunucuda yeniden yayın yok |
| Favoriler/geçmiş | Yerelde, hesapsız | Aynı temel; dışa aktarma sonra |
| Reconnect | 6 deneme, 1–30 sn | Aynı hedef, zaman aralıkları uygulanabilir öneri |
| Podcast hız | 0.8×–2× | Aynı |
| Sleep | Fade-out | Aynı |
| Radyoda canlı seek | Yok | Yok; yanlış beklenti oluşturma |
| SEO detay sayfaları | Var | Özgün metinli, az ve kaliteli dizin sayfaları |
| Tasarım ölçüleri | Piksel düzeyinde doğrulanmadı | Bu belgedeki özgün tasarım tokenları |
| Üyelik | Zorunlu değil | P0'da yok |
| Rusça/Türkçe/İngilizce | TuneWake çok dilli | Bu üç dili başlangıçtan destekle |

---

## 17. AÇIK RİSKLER VE GERÇEKÇİ SINIRLAR

1. **Bu belge mevcut proje kodunu görmedi.** Dolayısıyla mevcut klasör, bağımlılık, hazır bileşenler ve API geçişleri ancak AI Studio projesi içinde incelenebilir. Ajan, bu belgeyi mevcut projeye **uyarlamalıdır**.
2. **Canlı web UI tüm modal ve ikonları için birebir ekran görüntülü etkileşim denetimi yapılamadı.** Tam görsel/px eşleşme değil; kapsayıcı fonksiyonel benzerlik hedeflenir.
3. **Apple API kullanım koşulları ve oran sınırları geçerlidir.** Ticari prod deploy öncesi Apple marka/cover/data lisans maddeleri ayrıca kontrol edilmelidir.
4. **Radio Browser gönüllü ve değişken kalitede bir katalogdur.** Kırık URL ve kesinti normal senaryodur; `lastcheckok=1` sorunsuz playback garantisi değildir.
5. **Tarayıcılar autoplay, arka planda medya, fullscreen, wake-lock ve HLS konusunda farklılık gösterir.** Söz konusu özellikler tarayıcı desteğine ve kullanıcı etkileşimine bağlıdır.
6. **Podcastlerin RSS feed'leri bazen CORS, geo-blocking, premium hakları veya hatalı enclosure nedeniyle çalınamaz.** Bunları saklama.
7. **Bölüm bazlı global arama**, sadece Apple program aramasının üstüne etiket ekleyerek gerçekleşmez; gerçek bölüm index'i gerekebilir. P0'da program araması yapılır, tam bölüm indeksi P1'dir.
8. **Marka ve telif:** Referansın tasarım mantığını taklit etmek, marka/logo/kodun kopyalanması hakkı vermez. Yayıncı kapakları da hak sahibinin materyalidir.
9. **Gizlilik:** RSS adresinde özel erişim tokenı varsa backend log/caching ile sızıntı olabilir; P0 public RSS veya ayrı açık onay.
10. **Sunucu maliyetleri:** Ücretsiz katalog ve istemciden doğrudan ses, katalog/arama sunucu maliyetini sınırlayabilir; fakat büyük ölçekte cache, RSS istekleri ve barındırma masrafı olabilir.

---

## 18. ARAŞTIRMA KAYNAKLARI (3 KASIM 2026 İTİBARIYLA)

### Referans TuneWake kaynakları

1. Ana sayfa, tanıtım, dil seçenekleri ve keşif: https://www.tunewake.com/
2. Web dinleme UI, özellikler, klavye ve hata davranışı: https://www.tunewake.com/listen/
3. İşleyiş, katalog, sıralama, yenileme, attribution: https://www.tunewake.com/how-tunewake-works/
4. Radyo uygulaması ve fallback açıklaması: https://www.tunewake.com/radio-app/
5. Ülke listesi örneği: https://www.tunewake.com/radio/russia/
6. Tür listesi örneği: https://www.tunewake.com/radio/genre/pop/
7. Radyo detay örneği: https://www.tunewake.com/radio/usa/radio-paradise-main-mix/
8. Podcast keşif/kategori örneği: https://www.tunewake.com/podcasts/
9. Podcast detay/bölüm örneği: https://www.tunewake.com/podcasts/the-daily/
10. Android uygulama işlev listesi (web ile karıştırmayın): https://play.google.com/store/apps/details?id=com.tunewake.app
11. TuneWake kullanım şartları: https://www.tunewake.com/terms/
12. TuneWake gizlilik açıklaması: https://www.tunewake.com/privacy/

### Teknik ve entegrasyon kaynakları

13. Radio Browser proje ve veri lisansı: https://www.radio-browser.info/
14. Radio Browser başlangıç ve server mirrors: https://api.radio-browser.info/
15. Radio Browser endpoint/alan referansı: https://docs.radio-browser.info/
16. Apple iTunes Search API, parametre ve kısıtlar: https://performance-partners.apple.com/search-api
17. Apple Podcasts listelerinin neyi ölçtüğü: https://podcasters.apple.com/support/3146-apple-podcasts-charts
18. Google AI Studio Build Mode (React + Node + mevcut proje geliştirme): https://ai.google.dev/gemini-api/docs/aistudio-build-mode
19. Google AI Studio Firebase entegrasyonu (opsiyonel): https://firebase.google.com/docs/ai-assistance/ai-studio-integration

---

## SON TESLİM KOŞULU

**Tamamlandı** diyebilmek için aşağıdakiler aynı anda doğru olmalı:

- Radyo sonuçları gerçek kaynaktan geliyor ve gerçek ses açılıyor.
- Podcast sonuçları ve RSS bölümleri gerçek; episode ses çalıyor, ileri/geri/hız/ilerleme çalışıyor.
- Arama yazılabiliyor, tüm sekmeler ve filtreler doğru sonuç veriyor; boş/hata durumları var.
- Her butonun açık işlevi var; kullanılmayan öğeler gizli veya açıkça `Henüz kullanılamıyor` diye sınırlı.
- Player sayfalar arasında korunuyor ve sadece tek ses oynuyor.
- Favoriler, takip ve dinleme geçmişi persist ediliyor.
- Tasarım responsive, okunaklı ve TR/EN/RU uyumlu.
- Bozuk API/stream/RSS durumunda uygulama çökmeden toparlanıyor.
- Test raporu üretildi; iddia edilen özellik gerçekten çalışıyor.
- Mevcut Google AI Studio projesinin çalışan parçaları korunmuş durumda.

**Öncelik hiyerarşisi:** Çalışan ürün > gerçek veri > güvenilir playback > doğru arama > hatasız kullanıcı akışı > sade tasarım > kozmetik animasyon.

**BU DOKÜMANIN SONU**
