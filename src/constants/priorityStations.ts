import { RadioStation } from '../types';
import { ALL_TURKISH_STATIONS } from '../data/fallbackStations';

export interface PriorityStationDef {
  popularRank: number;
  name: string;
  mainCategory: string;
  categoryGroup: string;
  categoryGroupId: string;
  city: string;
  tags: string;
  badgeBg: string;
  badgeTextColor: string;
  badgeText: string;
  streamUrl: string;
  fallbackUrl?: string | null;
  favicon?: string;
}

// Exact Popüler İlk 20 from turkiye_radyo_envanteri_625_kategorili_2026-11-15.txt
export const EDITORIAL_PRIORITY_STATIONS: PriorityStationDef[] = [
  {
    popularRank: 1,
    name: 'Kral FM',
    mainCategory: 'Arabesk / Fantezi',
    categoryGroup: 'Arabesk',
    categoryGroupId: 'arabesk',
    city: 'İstanbul',
    tags: 'Arabesk / Fantezi • İstanbul',
    badgeBg: 'bg-[#B91C1C]',
    badgeTextColor: 'text-white',
    badgeText: 'KRAL FM',
    streamUrl: 'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8',
    fallbackUrl: 'https://ssldyg.radyotvonline.com/smil/smil:kralfm.smil/playlist.m3u8'
  },
  {
    popularRank: 2,
    name: 'Kral Pop',
    mainCategory: 'Türkçe Pop',
    categoryGroup: 'Türkçe Pop',
    categoryGroupId: 'turkce_pop',
    city: 'İstanbul',
    tags: 'Türkçe Pop • İstanbul',
    badgeBg: 'bg-[#DC2626]',
    badgeTextColor: 'text-white',
    badgeText: 'KRAL POP',
    streamUrl: 'https://ssldyg.radyotvonline.com/smil/smil:kralpop.smil/playlist.m3u8',
    fallbackUrl: 'https://dygedge2.radyotvonline.net/kralpop/playlist.m3u8'
  },
  {
    popularRank: 3,
    name: 'TRT FM',
    mainCategory: 'Türkçe Pop',
    categoryGroup: 'Türkçe Pop',
    categoryGroupId: 'turkce_pop',
    city: 'Ankara',
    tags: 'Türkçe Pop • Ankara',
    badgeBg: 'bg-white border border-slate-200 dark:border-transparent',
    badgeTextColor: 'text-[#E11D48]',
    badgeText: 'TRT FM',
    streamUrl: 'https://rd-trtfm.medya.trt.com.tr/master_128.m3u8',
    fallbackUrl: 'https://rd-trtfm.medya.trt.com.tr/master.m3u8'
  },
  {
    popularRank: 4,
    name: 'Radyo 7',
    mainCategory: 'Slow / Romantik',
    categoryGroup: 'Slow',
    categoryGroupId: 'slow',
    city: 'İstanbul',
    tags: 'Slow / Romantik • İstanbul',
    badgeBg: 'bg-[#7C3AED]',
    badgeTextColor: 'text-white',
    badgeText: 'Radyo 7',
    streamUrl: 'https://moondigitaledge.radyotvonline.net/radyo7/playlist.m3u8',
    fallbackUrl: 'http://46.20.3.251/stream/169/'
  },
  {
    popularRank: 5,
    name: 'Virgin Radio Türkiye',
    mainCategory: 'Yabancı Pop / Hit',
    categoryGroup: 'Yabancı Pop',
    categoryGroupId: 'yabanci_pop',
    city: 'Türkiye',
    tags: 'Yabancı Pop / Hit • Türkiye',
    badgeBg: 'bg-[#E11D48]',
    badgeTextColor: 'text-white',
    badgeText: 'VIRGIN',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/VIRGIN_RADIO_SC',
    fallbackUrl: 'http://28503.live.streamtheworld.com/VIRGIN_RADIO_SC'
  },
  {
    popularRank: 6,
    name: 'Süper FM',
    mainCategory: 'Türkçe Pop',
    categoryGroup: 'Türkçe Pop',
    categoryGroupId: 'turkce_pop',
    city: 'İstanbul',
    tags: 'Türkçe Pop • İstanbul',
    badgeBg: 'bg-[#1D4ED8]',
    badgeTextColor: 'text-white',
    badgeText: 'SÜPER',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SUPER_FM_SC',
    fallbackUrl: 'https://yayin.superfmradyo.com.tr/superfm/stream'
  },
  {
    popularRank: 7,
    name: 'Slow Türk',
    mainCategory: 'Slow / Romantik',
    categoryGroup: 'Slow',
    categoryGroupId: 'slow',
    city: 'İstanbul',
    tags: 'Slow / Romantik • İstanbul',
    badgeBg: 'bg-[#BE185D]',
    badgeTextColor: 'text-white',
    badgeText: 'SLOW',
    streamUrl: 'https://radyo.duhnet.tv/ak_dtvh_slowturk',
    fallbackUrl: 'https://radyo.duhnet.tv/slowturk'
  },
  {
    popularRank: 8,
    name: 'Radyo Seymen',
    mainCategory: 'Karadeniz / Yöresel',
    categoryGroup: 'Halk & Yöresel',
    categoryGroupId: 'halk_yoresel',
    city: 'Ankara',
    tags: 'Karadeniz / Yöresel • Ankara',
    badgeBg: 'bg-[#047857]',
    badgeTextColor: 'text-white',
    badgeText: 'SEYMEN',
    streamUrl: 'https://yayin.radyoseymen.com.tr:1070/stream',
    fallbackUrl: null
  },
  {
    popularRank: 9,
    name: 'PowerTürk',
    mainCategory: 'Türkçe Pop',
    categoryGroup: 'Türkçe Pop',
    categoryGroupId: 'turkce_pop',
    city: 'İstanbul',
    tags: 'Türkçe Pop • İstanbul',
    badgeBg: 'bg-black',
    badgeTextColor: 'text-white',
    badgeText: 'POWER',
    streamUrl: 'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    fallbackUrl: 'https://listen.powerapp.com.tr/powerturk/mpeg/icecast.audio'
  },
  {
    popularRank: 10,
    name: "Radyo 45'lik",
    mainCategory: 'Nostalji / Retro',
    categoryGroup: 'Nostalji & TSM',
    categoryGroupId: 'nostalji_tsm',
    city: 'İstanbul',
    tags: 'Nostalji / Retro • İstanbul',
    badgeBg: 'bg-[#D97706]',
    badgeTextColor: 'text-white',
    badgeText: "45'lik",
    streamUrl: 'https://stream.radyo45lik.com:4545/',
    fallbackUrl: null
  },
  {
    popularRank: 11,
    name: 'Kafa Radyo',
    mainCategory: 'Sohbet / Kültür',
    categoryGroup: 'Yerel & Genel',
    categoryGroupId: 'yerel_genel',
    city: 'İstanbul',
    tags: 'Sohbet / Kültür • İstanbul',
    badgeBg: 'bg-black',
    badgeTextColor: 'text-[#EF4444]',
    badgeText: 'KAFA',
    streamUrl: 'https://moondigitalmaster.radyotvonline.net/kafaradyo/playlist.m3u8',
    fallbackUrl: 'https://moondigitaledge2.radyotvonline.net/kafaradyo/playlist.m3u8'
  },
  {
    popularRank: 12,
    name: 'Kalp FM',
    mainCategory: 'Slow / Romantik',
    categoryGroup: 'Slow',
    categoryGroupId: 'slow',
    city: 'Türkiye',
    tags: 'Slow / Romantik • Türkiye',
    badgeBg: 'bg-[#E11D48]',
    badgeTextColor: 'text-white',
    badgeText: 'KALP',
    streamUrl: 'https://yayin.kalpfm.com:8080/',
    fallbackUrl: null
  },
  {
    popularRank: 13,
    name: 'Alem FM',
    mainCategory: 'Türkçe Pop',
    categoryGroup: 'Türkçe Pop',
    categoryGroupId: 'turkce_pop',
    city: 'İstanbul',
    tags: 'Türkçe Pop • İstanbul',
    badgeBg: 'bg-[#059669]',
    badgeTextColor: 'text-white',
    badgeText: 'ALEM',
    streamUrl: 'https://turkmedya.radyotvonline.net/alemfmaac',
    fallbackUrl: 'https://turkmedya.radyotvonline.net/alemfm/playlist.m3u8'
  },
  {
    popularRank: 14,
    name: 'Power FM',
    mainCategory: 'Yabancı Pop / Hit',
    categoryGroup: 'Yabancı Pop',
    categoryGroupId: 'yabanci_pop',
    city: 'İstanbul',
    tags: 'Yabancı Pop / Hit • İstanbul',
    badgeBg: 'bg-black',
    badgeTextColor: 'text-[#F59E0B]',
    badgeText: 'POWER FM',
    streamUrl: 'https://live.powerapp.com.tr/powerfm/abr/powerfm/128/playlist.m3u8',
    fallbackUrl: 'https://live.powerapp.com.tr/powerfm/abr/playlist.m3u8'
  },
  {
    popularRank: 15,
    name: 'Show Radyo',
    mainCategory: 'Türkçe Pop',
    categoryGroup: 'Türkçe Pop',
    categoryGroupId: 'turkce_pop',
    city: 'İstanbul',
    tags: 'Türkçe Pop • İstanbul',
    badgeBg: 'bg-[#EA580C]',
    badgeTextColor: 'text-white',
    badgeText: 'SHOW',
    streamUrl: 'https://showradyo.radyotvonline.net/showradyo',
    fallbackUrl: 'https://showradyo.radyotvonline.net/showradyo/playlist.m3u8'
  },
  {
    popularRank: 16,
    name: 'Radyo Turkuvaz',
    mainCategory: 'Türkçe Pop',
    categoryGroup: 'Türkçe Pop',
    categoryGroupId: 'turkce_pop',
    city: 'Türkiye',
    tags: 'Türkçe Pop • Türkiye',
    badgeBg: 'bg-[#0D9488]',
    badgeTextColor: 'text-white',
    badgeText: 'TURKUVAZ',
    streamUrl: 'https://trkvz-radyolar.ercdn.net/radyoturkuvaz/playlist.m3u8',
    fallbackUrl: null
  },
  {
    popularRank: 17,
    name: 'Best FM',
    mainCategory: 'Türkçe Pop',
    categoryGroup: 'Türkçe Pop',
    categoryGroupId: 'turkce_pop',
    city: 'İstanbul',
    tags: 'Türkçe Pop • İstanbul',
    badgeBg: 'bg-[#2563EB]',
    badgeTextColor: 'text-white',
    badgeText: 'Best FM',
    streamUrl: 'https://ssldyg.radyotvonline.com/best/bestfm.stream/playlist.m3u8',
    fallbackUrl: null
  },
  {
    popularRank: 18,
    name: 'Joy Türk',
    mainCategory: 'Türkçe Pop',
    categoryGroup: 'Türkçe Pop',
    categoryGroupId: 'turkce_pop',
    city: 'İstanbul',
    tags: 'Türkçe Pop • İstanbul',
    badgeBg: 'bg-[#E11D48]',
    badgeTextColor: 'text-white',
    badgeText: 'JoyTürk',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC',
    fallbackUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_ITUNES.mp3'
  },
  {
    popularRank: 19,
    name: 'Metro FM',
    mainCategory: 'Yabancı Pop / Hit',
    categoryGroup: 'Yabancı Pop',
    categoryGroupId: 'yabanci_pop',
    city: 'İstanbul',
    tags: 'Yabancı Pop / Hit • İstanbul',
    badgeBg: 'bg-[#0369A1]',
    badgeTextColor: 'text-white',
    badgeText: 'METRO',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FM_SC',
    fallbackUrl: 'http://27753.live.streamtheworld.com:3690/METRO_FMAAC_SC'
  },
  {
    popularRank: 20,
    name: 'Radyo D',
    mainCategory: 'Türkçe Pop',
    categoryGroup: 'Türkçe Pop',
    categoryGroupId: 'turkce_pop',
    city: 'İstanbul',
    tags: 'Türkçe Pop • İstanbul',
    badgeBg: 'bg-[#DC2626]',
    badgeTextColor: 'text-white',
    badgeText: 'Radyo D',
    streamUrl: 'https://ssldyg.radyotvonline.com/radyod/radyod.stream/playlist.m3u8',
    fallbackUrl: 'https://moondigitaledge.radyotvonline.net/radyod/playlist.m3u8'
  }
];

function cleanNorm(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]/g, '');
}

export function getEditorialPriorityStations(): RadioStation[] {
  return EDITORIAL_PRIORITY_STATIONS.map((p) => {
    const foundByRank = ALL_TURKISH_STATIONS.find((s) => s.popularRank === p.popularRank);
    const cleanP = cleanNorm(p.name);
    const foundByName =
      foundByRank ||
      ALL_TURKISH_STATIONS.find((s) => cleanNorm(s.name) === cleanP);

    const stationUuid = foundByName?.stationuuid || `editorial-${p.popularRank}-${cleanP}`;
    return {
      ...(foundByName || {}),
      stationuuid: stationUuid,
      id: stationUuid,
      name: p.name,
      playUrl: foundByName?.playUrl || p.streamUrl,
      streamUrl: foundByName?.streamUrl || p.streamUrl,
      url: foundByName?.url || p.streamUrl,
      url_resolved: foundByName?.url_resolved || p.streamUrl,
      fallbackUrl: foundByName?.fallbackUrl ?? p.fallbackUrl ?? null,
      homepage: foundByName?.homepage || '',
      favicon: foundByName?.favicon || p.favicon || '',
      tags: foundByName?.tags || p.tags,
      country: 'Turkey',
      countrycode: 'TR',
      countryCode: 'TR',
      state: foundByName?.state || p.city,
      language: 'turkish',
      votes: 100000 - (p.popularRank - 1) * 500,
      codec: foundByName?.codec || 'HLS',
      bitrate: foundByName?.bitrate || 128,
      mainCategory: p.mainCategory,
      categoryGroup: p.categoryGroup,
      categoryGroupId: p.categoryGroupId,
      isPopular: true,
      popularRank: p.popularRank
    };
  });
}
