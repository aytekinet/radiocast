# RadioCast — KNOWN_LIMITATIONS.md

**Tarih:** 3 Kasım 2026

Bu belge, tarayıcı ortamı, harici açık API'ler ve işletim sistemi sınırları nedeniyle ortaya çıkabilecek doğal teknik kısıtları açıkça belirtir:

1. **Tarayıcı Uyurken Arka Planda Çalma & Alarm (Web Environment)**:
   - Web tarayıcılarında sekme açıkken veya minimizasyon durumunda ses çalmaya devam eder; ancak bilgisayar/telefon tamamen uyku moduna geçtiğinde veya işletim sistemi tarayıcı sürecini uyuttuğunda tarayıcı yerel bir Android Alarm servisi gibi kesin uyanma garantisi veremez. (Bu sebeple şartnameye uygun olarak web sürümüne sahte yerel alarm vaadi eklenmemiştir).
2. **Karma İçerik (Mixed Content - HTTP Yayınları)**:
   - HTTPS protokolüyle yayınlanan web uygulamalarında modern tarayıcılar HTTP ses akışlarını engelleyebilir. Uygulama bu durumu aşmak için öncelikle HTTPS çözümlenmiş URL'leri (`url_resolved`) dener, gerektiğinde yerel backend proxy (`/api/radio/proxy`) üzerinden iletir.
3. **Radio Browser Gönüllü API Aynaları**:
   - Radio Browser küresel bir gönüllü ağdır. Bazı istasyonların yayın linkleri zaman içinde yayıncı tarafından değiştirilebilir. Bu durumlarda 6 kademeli otomatik yeniden bağlanma çalışır ve erişilemezse yerel yedek Türk istasyonları devreye girer.
4. **Podcast RSS CORS Kısıtlamaları**:
   - Bazı podcast yapımcılarının RSS XML sunucuları tarayıcıdan doğrudan `fetch` isteklerine CORS başlığı vermez. Bu tür beslemeler sunucumuzun güvenli ve SSRF korumalı backend proxy'si üzerinden çekilir.
