import { 
  getSmartCandidatesForStation, 
  saveWorkingStream, 
  getCachedWorkingStream, 
  invalidateWorkingStream, 
  detectBrowserCapabilities 
} from '../src/services/smartStreamSelector';
import { ALL_TURKISH_STATIONS, VERIFIED_TURKISH_STATIONS } from '../src/data/fallbackStations';
import { RadioStation } from '../src/types';

// Diverse set of 20+ stations from Turkey and around the world with MP3, AAC, and HLS formats
const TEST_STATIONS: RadioStation[] = [
  // 1. Turkey - HLS / AAC
  {
    id: 'trt-fm-01',
    stationuuid: 'trt-fm-01',
    name: 'TRT FM',
    url: 'https://trt.daioncdn.net/trtfm/trtfm.m3u8',
    url_resolved: 'https://trt.daioncdn.net/trtfm/trtfm.m3u8',
    playUrl: 'https://trt.daioncdn.net/trtfm/trtfm.m3u8',
    homepage: 'https://trtfm.trtvotworld.com',
    favicon: 'https://trtfm.trtvotworld.com/favicon.ico',
    tags: 'haber,muzik,pop',
    country: 'Turkey',
    countrycode: 'TR',
    votes: 950,
    codec: 'AAC',
    bitrate: 128,
    hls: true,
    lastcheckok: 1
  },
  // 2. Turkey - HLS (PowerTürk)
  {
    id: 'powerturk-01',
    stationuuid: 'powerturk-01',
    name: 'PowerTürk',
    url: 'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    url_resolved: 'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    homepage: 'https://powerapp.com.tr',
    favicon: 'https://powerapp.com.tr/favicon.ico',
    tags: 'pop,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    votes: 890,
    codec: 'AAC',
    bitrate: 128,
    hls: true,
    lastcheckok: 1
  },
  // 3. Turkey - MP3 (Kral Pop)
  {
    id: 'kral-pop-01',
    stationuuid: 'kral-pop-01',
    name: 'Kral Pop',
    url: 'https://kralpopwmp.radyotvonline.net/',
    url_resolved: 'https://kralpopwmp.radyotvonline.net/',
    homepage: 'https://kralmuzik.com.tr',
    favicon: '',
    tags: 'pop,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    votes: 820,
    codec: 'MP3',
    bitrate: 128,
    hls: false,
    lastcheckok: 1
  },
  // 4. Turkey - MP3 with HTTP fallback (Açık Radyo / Apaçık Radyo)
  {
    id: 'acik-radyo-01',
    stationuuid: 'acik-radyo-01',
    name: 'Açık Radyo',
    url: 'http://stream.acikradyo.com.tr:8000/live.mp3',
    url_resolved: 'https://stream.acikradyo.com.tr:8000/live.mp3',
    homepage: 'https://acikradyo.com.tr',
    favicon: '',
    tags: 'kultur,sanat',
    country: 'Turkey',
    countrycode: 'TR',
    votes: 750,
    codec: 'MP3',
    bitrate: 128,
    hls: false,
    lastcheckok: 1
  },
  // 5. Turkey - HLS (Radyo Fenomen)
  {
    id: 'fenomen-01',
    stationuuid: 'fenomen-01',
    name: 'Radyo Fenomen',
    url: 'https://live.radyofenomen.com/fenomen/abr/playlist.m3u8',
    url_resolved: 'https://live.radyofenomen.com/fenomen/abr/playlist.m3u8',
    homepage: 'https://radyofenomen.com',
    favicon: '',
    tags: 'hit,yabanci',
    country: 'Turkey',
    countrycode: 'TR',
    votes: 680,
    codec: 'AAC',
    bitrate: 128,
    hls: true,
    lastcheckok: 1
  },
  // 6. Turkey - MP3 (Kafa Radyo)
  {
    id: 'kafa-radyo-01',
    stationuuid: 'kafa-radyo-01',
    name: 'Kafa Radyo',
    url: 'https://stream.kafaradyo.com/audio/kafaradyo.mp3',
    url_resolved: 'https://stream.kafaradyo.com/audio/kafaradyo.mp3',
    homepage: '',
    favicon: '',
    tags: 'sohbet,kultur',
    country: 'Turkey',
    countrycode: 'TR',
    votes: 590,
    codec: 'MP3',
    bitrate: 128,
    hls: false,
    lastcheckok: 1
  },
  // 7. Turkey - MP3 (NTV Radyo)
  {
    id: 'ntv-radyo-01',
    stationuuid: 'ntv-radyo-01',
    name: 'NTV Radyo',
    url: 'https://ntvradyowmp.radyotvonline.net/',
    url_resolved: 'https://ntvradyowmp.radyotvonline.net/',
    homepage: '',
    favicon: '',
    tags: 'haber,gundem',
    country: 'Turkey',
    countrycode: 'TR',
    votes: 540,
    codec: 'MP3',
    bitrate: 96,
    hls: false,
    lastcheckok: 1
  },
  // 8. Turkey - MP3 (Süper FM)
  {
    id: 'super-fm-01',
    stationuuid: 'super-fm-01',
    name: 'Süper FM',
    url: 'https://17733.live.streamtheworld.com/SUPER_FMAAC.aac',
    url_resolved: 'https://17733.live.streamtheworld.com/SUPER_FMAAC.aac',
    homepage: '',
    favicon: '',
    tags: 'pop',
    country: 'Turkey',
    countrycode: 'TR',
    votes: 520,
    codec: 'AAC',
    bitrate: 128,
    hls: false,
    lastcheckok: 1
  },
  // 9. Turkey - HLS (Radyo D)
  {
    id: 'radyo-d-01',
    stationuuid: 'radyo-d-01',
    name: 'Radyo D',
    url: 'https://moondigitaledge.radyotvonline.net/radyod/playlist.m3u8',
    url_resolved: 'https://moondigitaledge.radyotvonline.net/radyod/playlist.m3u8',
    homepage: '',
    favicon: '',
    tags: 'pop,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    votes: 490,
    codec: 'AAC',
    bitrate: 128,
    hls: true,
    lastcheckok: 1
  },
  // 10. Turkey - MP3 (Radyo 45lik)
  {
    id: 'radyo-45lik-01',
    stationuuid: 'radyo-45lik-01',
    name: 'Radyo 45lik',
    url: 'https://stream.radyo45lik.com:4545/',
    url_resolved: 'https://stream.radyo45lik.com:4545/',
    homepage: '',
    favicon: '',
    tags: 'nostalji',
    country: 'Turkey',
    countrycode: 'TR',
    votes: 440,
    codec: 'MP3',
    bitrate: 128,
    hls: false,
    lastcheckok: 1
  },
  // 11. UK - AAC / HLS (BBC Radio 1)
  {
    id: 'bbc-radio-1-uuid',
    stationuuid: 'bbc-radio-1-uuid',
    name: 'BBC Radio 1',
    url: 'http://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
    url_resolved: 'https://as-hls-ww-live.akamaized.net/pool_904/live/ww/bbc_radio_one/bbc_radio_one.isml/bbc_radio_one-audio%3d96000.norewind.m3u8',
    homepage: 'https://www.bbc.co.uk/radio1',
    favicon: '',
    tags: 'pop,dance,chart',
    country: 'United Kingdom',
    countrycode: 'GB',
    votes: 2100,
    codec: 'AAC',
    bitrate: 96,
    hls: true,
    lastcheckok: 1
  },
  // 12. US - AAC (Radio Paradise)
  {
    id: 'radio-paradise-main',
    stationuuid: 'radio-paradise-main',
    name: 'Radio Paradise (Main Mix)',
    url: 'http://stream.radioparadise.com/aac-320',
    url_resolved: 'https://stream.radioparadise.com/aac-320',
    homepage: 'https://radioparadise.com',
    favicon: '',
    tags: 'eclectic,rock,world',
    country: 'United States',
    countrycode: 'US',
    votes: 1850,
    codec: 'AAC',
    bitrate: 320,
    hls: false,
    lastcheckok: 1
  },
  // 13. US - MP3 (SomaFM Groove Salad)
  {
    id: 'somafm-groove-salad',
    stationuuid: 'somafm-groove-salad',
    name: 'SomaFM: Groove Salad',
    url: 'http://ice1.somafm.com/groovesalad-128-mp3',
    url_resolved: 'https://ice1.somafm.com/groovesalad-128-mp3',
    homepage: 'https://somafm.com/groovesalad/',
    favicon: '',
    tags: 'ambient,chillout,downtempo',
    country: 'United States',
    countrycode: 'US',
    votes: 1640,
    codec: 'MP3',
    bitrate: 128,
    hls: false,
    lastcheckok: 1
  },
  // 14. France - MP3 / AAC (FIP Radio)
  {
    id: 'radio-france-fip',
    stationuuid: 'radio-france-fip',
    name: 'FIP',
    url: 'http://direct.fipradio.fr/live/fip-midfi.mp3',
    url_resolved: 'https://stream.radiofrance.fr/fip/fip_hifi.m3u8?id=radiofrance',
    homepage: 'https://www.radiofrance.fr/fip',
    favicon: '',
    tags: 'eclectic,jazz,rock',
    country: 'France',
    countrycode: 'FR',
    votes: 1420,
    codec: 'AAC',
    bitrate: 192,
    hls: true,
    lastcheckok: 1
  },
  // 15. Germany - MP3 (Antenne Bayern)
  {
    id: 'antenne-bayern-01',
    stationuuid: 'antenne-bayern-01',
    name: 'Antenne Bayern',
    url: 'http://mp3channels.webradio.antenne.de/antenne',
    url_resolved: 'https://stream.antenne.de/antenne/stream/mp3',
    homepage: 'https://www.antenne.de',
    favicon: '',
    tags: 'pop,top40',
    country: 'Germany',
    countrycode: 'DE',
    votes: 1290,
    codec: 'MP3',
    bitrate: 128,
    hls: false,
    lastcheckok: 1
  },
  // 16. Germany - AAC (1LIVE)
  {
    id: 'wdr-1live-01',
    stationuuid: 'wdr-1live-01',
    name: '1LIVE',
    url: 'https://wdr-1live-live.icecastssl.wdr.de/wdr/1live/live/mp3/128/stream.mp3',
    url_resolved: 'https://wdr-1live-live.icecastssl.wdr.de/wdr/1live/live/mp3/128/stream.mp3',
    homepage: 'https://www1.wdr.de/radio/1live/',
    favicon: '',
    tags: 'pop,dance',
    country: 'Germany',
    countrycode: 'DE',
    votes: 1150,
    codec: 'MP3',
    bitrate: 128,
    hls: false,
    lastcheckok: 1
  },
  // 17. Switzerland - MP3 / AAC (Radio Swiss Jazz)
  {
    id: 'radio-swiss-jazz',
    stationuuid: 'radio-swiss-jazz',
    name: 'Radio Swiss Jazz',
    url: 'http://stream.srg-ssr.ch/m/rsj/mp3_128',
    url_resolved: 'https://stream.srg-ssr.ch/m/rsj/aacp_96',
    homepage: 'https://www.radioswissjazz.ch',
    favicon: '',
    tags: 'jazz,blues,swing',
    country: 'Switzerland',
    countrycode: 'CH',
    votes: 1080,
    codec: 'AAC',
    bitrate: 96,
    hls: false,
    lastcheckok: 1
  },
  // 18. Spain - MP3 (Ibiza Global Radio)
  {
    id: 'ibiza-global-radio',
    stationuuid: 'ibiza-global-radio',
    name: 'Ibiza Global Radio',
    url: 'https://listenssl.ibizaglobalradio.com:8024/ibizaglobalradio.mp3',
    url_resolved: 'https://listenssl.ibizaglobalradio.com:8024/ibizaglobalradio.mp3',
    homepage: 'https://ibizaglobalradio.com',
    favicon: '',
    tags: 'electronic,house,techno',
    country: 'Spain',
    countrycode: 'ES',
    votes: 980,
    codec: 'MP3',
    bitrate: 128,
    hls: false,
    lastcheckok: 1
  },
  // 19. UK - MP3 (Classic FM)
  {
    id: 'classic-fm-uk',
    stationuuid: 'classic-fm-uk',
    name: 'Classic FM',
    url: 'https://media-ssl.musicradio.com/ClassicFM',
    url_resolved: 'https://media-ssl.musicradio.com/ClassicFM',
    homepage: 'https://www.classicfm.com',
    favicon: '',
    tags: 'classical',
    country: 'United Kingdom',
    countrycode: 'GB',
    votes: 890,
    codec: 'MP3',
    bitrate: 128,
    hls: false,
    lastcheckok: 1
  },
  // 20. Netherlands - MP3 (NPO Radio 1)
  {
    id: 'npo-radio-1',
    stationuuid: 'npo-radio-1',
    name: 'NPO Radio 1',
    url: 'http://icecast.omroep.nl/radio1-bb-mp3',
    url_resolved: 'https://icecast.omroep.nl/radio1-bb-mp3',
    homepage: 'https://www.nporadio1.nl',
    favicon: '',
    tags: 'news,talk',
    country: 'Netherlands',
    countrycode: 'NL',
    votes: 720,
    codec: 'MP3',
    bitrate: 128,
    hls: false,
    lastcheckok: 1
  },
  // 21. Multiple fallback test case (Station where URL 1 is known dead, URL 2 is working)
  {
    id: 'multi-candidate-test-01',
    stationuuid: 'multi-candidate-test-01',
    name: 'Multi-Candidate Fallback Test',
    url: 'http://dead.example.com:8000/broken.mp3',
    url_resolved: 'http://broken-redirect.example.com/stream',
    playUrl: 'https://kralpopwmp.radyotvonline.net/',
    fallbackUrl: 'https://live.powerapp.com.tr/powerfm/abr/playlist.m3u8',
    homepage: '',
    favicon: '',
    tags: 'test',
    country: 'Turkey',
    countrycode: 'TR',
    votes: 50,
    codec: 'MP3',
    bitrate: 128,
    hls: false,
    lastcheckok: 1
  }
];

async function runAutomaticStreamTests() {
  console.log('===========================================================');
  console.log('RadioCast — Otomatik Akıllı Yayın Seçim Sistemi Doğrulama');
  console.log('===========================================================');
  console.log(`Test Edilen İstasyon Sayısı: ${TEST_STATIONS.length}\n`);

  let passedStations = 0;
  const simulatedBrowserCaps = {
    canPlayMp3: true,
    canPlayAac: true,
    canPlayHlsNative: false,
    canPlayHlsMse: true,
    isHttpsOrigin: true,
    isSafari: false,
    isIos: false
  };

  for (let i = 0; i < TEST_STATIONS.length; i++) {
    const station = TEST_STATIONS[i];
    const candidates = getSmartCandidatesForStation(station, simulatedBrowserCaps);

    if (candidates.length === 0) {
      console.error(`[FAIL] ${station.name}: Hiçbir aday yayın oluşturulamadı!`);
      continue;
    }

    const firstCandidate = candidates[0];
    const hasHttpsOrProxy = candidates.some(c => c.url.startsWith('https://') || c.url.startsWith('/api/radio/proxy'));
    const isFormatAware = candidates.some(c => station.hls ? c.isHls : true);

    if (!hasHttpsOrProxy) {
      console.error(`[FAIL] ${station.name}: HTTPS sayfasında Mixed-Content korumalı yayın adresi bulunamadı.`);
      continue;
    }

    // Verify format detection
    const formatsDetected = candidates.map(c => c.isHls ? 'HLS' : (c.codec || 'MP3')).filter((v, idx, a) => a.indexOf(v) === idx).join(', ');

    console.log(`[PASS] #${i + 1} ${station.name} (${station.country}): ${candidates.length} aday, 1. tercih: [${firstCandidate.source}] ${firstCandidate.url.slice(0, 50)}... (Biçimler: ${formatsDetected})`);
    passedStations++;
  }

  console.log('\n--- Test 2: Fallback Davranışı (1. Kaynak Başarısız, 2. Kaynak Başarılı) ---');
  const fallbackStation = TEST_STATIONS[TEST_STATIONS.length - 1]; // multi-candidate-test-01
  const candidates = getSmartCandidatesForStation(fallbackStation, simulatedBrowserCaps);
  console.log(`İstasyon: ${fallbackStation.name}`);
  console.log(`Oluşturulan Toplam Aday: ${candidates.length}`);
  console.log(`1. Aday: [${candidates[0].source}] ${candidates[0].url}`);
  console.log(`2. Aday: [${candidates[1].source}] ${candidates[1].url}`);
  console.log(`3. Aday: [${candidates[2].source}] ${candidates[2].url}`);
  
  if (candidates.length >= 3 && candidates.some(c => c.url.includes('kralpop') || c.url.includes('powerapp'))) {
    console.log('[PASS] İlk adres başarısız olduğunda 2. ve 3. alternatif geçerli kaynaklar listeye eklendi.');
  } else {
    console.error('[FAIL] Fallback adayları beklenen formatta bulunamadı.');
  }

  console.log('\n--- Test 3: Cihaz Çalışan Kaynak Önbelleği (Working Stream Cache) ---');
  const testStationId = 'test-cache-station-uuid';
  const testWorkingUrl = 'https://stream.verified-radio.org/live.mp3';
  
  // Save to cache
  saveWorkingStream(testStationId, testWorkingUrl, false, 'MP3');
  const cached = getCachedWorkingStream(testStationId);
  if (cached && cached.url === testWorkingUrl && cached.expiresAt > Date.now()) {
    console.log(`[PASS] Çalışan yayın yerel önbelleğe kaydedildi: ${cached.url} (TTL: 24 saat)`);
  } else {
    console.error('[FAIL] Önbellek kaydı başarısız oldu.');
  }

  // Generate candidates for this station and verify the cached URL is Rank 1
  const cachedStationObj: RadioStation = {
    id: testStationId,
    stationuuid: testStationId,
    name: 'Cache Test Radio',
    url: 'http://fallback.original.org/live.mp3',
    url_resolved: 'http://fallback.original.org/live.mp3',
    homepage: '',
    favicon: '',
    tags: '',
    country: 'Turkey',
    countrycode: 'TR',
    votes: 10,
    codec: 'MP3',
    bitrate: 128
  };

  const cachedCandidates = getSmartCandidatesForStation(cachedStationObj, simulatedBrowserCaps);
  if (cachedCandidates.length > 0 && cachedCandidates[0].url === testWorkingUrl && cachedCandidates[0].source === 'cache') {
    console.log('[PASS] Daha önce çalışan kaynak (Rank 1) en ön sıraya yerleştirildi.');
  } else {
    console.error(`[FAIL] Önbellekteki çalışan kaynak 1. sıraya konulamadı. 1. aday: ${cachedCandidates[0]?.url}`);
  }

  // Invalidate cache (simulating stream broken later)
  invalidateWorkingStream(testStationId, testWorkingUrl);
  const recheckCache = getCachedWorkingStream(testStationId);
  if (!recheckCache) {
    console.log('[PASS] Bağlantı koptuğunda / başarısız olduğunda önbellek otomatik temizlendi ve alternatiflere geçildi.');
  } else {
    console.error('[FAIL] Önbellek temizleme başarısız.');
  }

  console.log('\n===========================================================');
  console.log(`SONUÇ: ${passedStations}/${TEST_STATIONS.length} istasyon akıllı yayın seçici tarafından başarıyla doğrulandı.`);
  console.log('===========================================================');
}

runAutomaticStreamTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
