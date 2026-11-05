import { RadioStation } from '../types';
import { ALL_TURKISH_STATIONS } from '../data/fallbackStations';

export interface PriorityStationDef {
  name: string;
  tags: string;
  badgeBg: string;
  badgeTextColor: string;
  badgeText: string;
  streamUrl: string;
  favicon?: string;
}

export const EDITORIAL_PRIORITY_STATIONS: PriorityStationDef[] = [
  {
    name: 'Kafa Radyo',
    tags: 'Alternatif • Türkiye',
    badgeBg: 'bg-black',
    badgeTextColor: 'text-[#EF4444]',
    badgeText: 'KAFA',
    streamUrl: 'https://moondigitalmaster.radyotvonline.net/kafaradyo/playlist.m3u8'
  },
  {
    name: 'TRT FM',
    tags: 'Haber • Kültür • Türkiye',
    badgeBg: 'bg-white',
    badgeTextColor: 'text-[#E11D48]',
    badgeText: 'TRT',
    streamUrl: 'https://rd-trtfm.medya.trt.com.tr/master_128.m3u8'
  },
  {
    name: 'Radyo Fenomen',
    tags: 'Yabancı Pop • Türkiye',
    badgeBg: 'bg-[#EAB308]',
    badgeTextColor: 'text-black',
    badgeText: 'FENOMEN',
    streamUrl: 'https://live.radyofenomen.com/fenomen/128/icecast.audio'
  },
  {
    name: 'Best FM',
    tags: 'Pop • Türkiye',
    badgeBg: 'bg-[#2563EB]',
    badgeTextColor: 'text-white',
    badgeText: 'Best FM',
    streamUrl: 'https://ssldyg.radyotvonline.com/best/bestfm.stream/playlist.m3u8'
  },
  {
    name: 'Alem FM',
    tags: 'Pop • Türkiye',
    badgeBg: 'bg-[#059669]',
    badgeTextColor: 'text-white',
    badgeText: 'Alem FM',
    streamUrl: 'https://turkmedya.radyotvonline.net/alemfmaac'
  },
  {
    name: 'Kral Pop',
    tags: 'Pop • Türkiye',
    badgeBg: 'bg-[#DC2626]',
    badgeTextColor: 'text-white',
    badgeText: 'KRAL',
    streamUrl: 'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8'
  },
  {
    name: 'Kral FM',
    tags: 'Arabesk • Türkiye',
    badgeBg: 'bg-[#B91C1C]',
    badgeTextColor: 'text-white',
    badgeText: 'KRAL FM',
    streamUrl: 'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8'
  },
  {
    name: 'PowerTürk',
    tags: 'Pop • Türkiye',
    badgeBg: 'bg-black',
    badgeTextColor: 'text-white',
    badgeText: 'POWER',
    streamUrl: 'https://listen.powerapp.com.tr/powerturkslow/mpeg/icecast.audio'
  },
  {
    name: 'Süper FM',
    tags: 'Pop • Türkiye',
    badgeBg: 'bg-[#1D4ED8]',
    badgeTextColor: 'text-white',
    badgeText: 'SÜPER',
    streamUrl: 'https://yayin.superfmradyo.com.tr/superfm/stream'
  },
  {
    name: 'Radyo 7',
    tags: 'Genel • Türkiye',
    badgeBg: 'bg-[#7C3AED]',
    badgeTextColor: 'text-white',
    badgeText: 'Radyo 7',
    streamUrl: 'https://moondigitaledge.radyotvonline.net/radyo7/playlist.m3u8'
  },
  {
    name: 'NTV Radyo',
    tags: 'Haber • Türkiye',
    badgeBg: 'bg-[#EA580C]',
    badgeTextColor: 'text-white',
    badgeText: 'NTV',
    streamUrl: 'https://dygedge2.radyotvonline.net/ntvradyo/playlist.m3u8'
  },
  {
    name: 'SlowTürk',
    tags: 'Slow Müzik • Türkiye',
    badgeBg: 'bg-[#BE185D]',
    badgeTextColor: 'text-white',
    badgeText: 'SlowTürk',
    streamUrl: 'https://radyo.duhnet.tv/ak_dtvh_slowturk'
  },
  {
    name: 'Açık Radyo',
    tags: 'Kültür • Türkiye',
    badgeBg: 'bg-[#0284C7]',
    badgeTextColor: 'text-white',
    badgeText: 'Açık Radyo',
    streamUrl: 'http://stream.34bit.net/ar.aac'
  },
  {
    name: 'Metro FM',
    tags: 'Yabancı Pop • Türkiye',
    badgeBg: 'bg-[#0369A1]',
    badgeTextColor: 'text-white',
    badgeText: 'METRO',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FM_SC'
  },
  {
    name: 'JoyTürk',
    tags: 'Slow • Türkiye',
    badgeBg: 'bg-[#E11D48]',
    badgeTextColor: 'text-white',
    badgeText: 'JoyTürk',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC'
  },
  {
    name: 'Power FM',
    tags: 'Yabancı Müzik • Türkiye',
    badgeBg: 'bg-black',
    badgeTextColor: 'text-[#F59E0B]',
    badgeText: 'POWER FM',
    streamUrl: 'https://live.powerapp.com.tr/powerfm/abr/playlist.m3u8'
  },
  {
    name: 'Radyo D',
    tags: 'Pop • Türkiye',
    badgeBg: 'bg-[#DC2626]',
    badgeTextColor: 'text-white',
    badgeText: 'Radyo D',
    streamUrl: 'https://moondigitaledge.radyotvonline.net/radyod/playlist.m3u8'
  },
  {
    name: "Radyo 45'lik",
    tags: 'Nostalji • Türkiye',
    badgeBg: 'bg-[#D97706]',
    badgeTextColor: 'text-white',
    badgeText: "45'lik",
    streamUrl: 'https://stream.radyo45lik.com:4545/'
  },
  {
    name: 'Virgin Radio Türkiye',
    tags: 'Yabancı Hit • Türkiye',
    badgeBg: 'bg-[#E11D48]',
    badgeTextColor: 'text-white',
    badgeText: 'VIRGIN',
    streamUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/VIRGIN_RADIO_SC'
  }
];

export function getEditorialPriorityStations(): RadioStation[] {
  return EDITORIAL_PRIORITY_STATIONS.map((p, idx) => {
    // Find matching catalog station if present
    const cleanP = p.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = ALL_TURKISH_STATIONS.find((s) => {
      const cleanS = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanS === cleanP || cleanS.includes(cleanP);
    });

    const stationUuid = found?.stationuuid || `editorial-${idx + 1}-${cleanP}`;
    return {
      stationuuid: stationUuid,
      id: stationUuid,
      name: p.name,
      url: p.streamUrl,
      url_resolved: p.streamUrl,
      homepage: found?.homepage || '',
      favicon: found?.favicon || p.favicon || '',
      tags: p.tags,
      country: 'Turkey',
      countrycode: 'TR',
      language: 'Turkish',
      votes: Math.max(found?.votes || 0, 1000 - idx * 25),
      codec: 'MP3',
      bitrate: found?.bitrate || 128
    };
  });
}
