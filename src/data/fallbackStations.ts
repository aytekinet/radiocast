import { RadioStation } from '../types';
import allTurkishStationsJson from './allTurkishStations.json';

export const ALL_TURKISH_STATIONS: RadioStation[] = allTurkishStationsJson as RadioStation[];

export interface VerifiedStationInfo {
  name: string;
  urls: string[];
  tags: string;
  favicon: string;
}

export const VERIFIED_TURKISH_STATIONS: RadioStation[] = [
  {
    stationuuid: 'v-kafa-radyo',
    name: 'Kafa Radyo',
    playUrl: 'https://moondigitalmaster.radyotvonline.net/kafaradyo/playlist.m3u8',
    url: 'https://moondigitalmaster.radyotvonline.net/kafaradyo/playlist.m3u8',
    url_resolved: 'https://moondigitalmaster.radyotvonline.net/kafaradyo/playlist.m3u8',
    homepage: 'https://www.kafaradyo.com',
    favicon: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&q=80',
    tags: 'pop,rock,sohbet,kultur,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 35000,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-powerturk',
    name: 'PowerTürk',
    playUrl: 'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    url: 'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    url_resolved: 'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    homepage: 'https://www.powerapp.com.tr',
    favicon: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80',
    tags: 'pop,turkce pop,top40,hit',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 30000,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-super-fm',
    name: 'Süper FM',
    playUrl: 'https://29103.live.streamtheworld.com/SUPER_FM_SC',
    url: 'https://29103.live.streamtheworld.com/SUPER_FM_SC',
    url_resolved: 'https://29103.live.streamtheworld.com/SUPER_FM_SC',
    homepage: 'https://www.superfm.com.tr',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'pop,top40,hit,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 29000,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-best-fm',
    name: 'Best FM',
    playUrl: 'https://ssldyg.radyotvonline.com/best/bestfm.stream/playlist.m3u8',
    url: 'https://ssldyg.radyotvonline.com/best/bestfm.stream/playlist.m3u8',
    url_resolved: 'https://ssldyg.radyotvonline.com/best/bestfm.stream/playlist.m3u8',
    homepage: 'https://www.bestfm.com.tr',
    favicon: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80',
    tags: 'pop,turkce,sohbet',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 28500,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-radyo-d',
    name: 'Radyo D',
    playUrl: 'https://moondigitaledge2.radyotvonline.net/radyod/playlist.m3u8',
    url: 'https://moondigitaledge2.radyotvonline.net/radyod/playlist.m3u8',
    url_resolved: 'https://moondigitaledge2.radyotvonline.net/radyod/playlist.m3u8',
    homepage: 'https://www.radyod.com.tr',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'pop,turkce,hit',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 28000,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-radyo-viva',
    name: 'Radyo Viva',
    playUrl: 'https://showradyo.radyotvonline.net/radyoviva',
    url: 'https://showradyo.radyotvonline.net/radyoviva',
    url_resolved: 'https://showradyo.radyotvonline.net/radyoviva',
    homepage: 'https://www.radyoviva.com.tr',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
    tags: 'pop,turkce,muzik',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 27500,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-show-radyo',
    name: 'Show Radyo',
    playUrl: 'https://showradyo.radyotvonline.net/showradyo',
    url: 'https://showradyo.radyotvonline.net/showradyo',
    url_resolved: 'https://showradyo.radyotvonline.net/showradyo',
    homepage: 'https://www.showradyo.com.tr',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
    tags: 'pop,turkce,haber,sohbet',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 27000,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-alem-fm',
    name: 'Alem FM',
    playUrl: 'https://edge1.radyotvonline.net/shoutcast/play/alemfm',
    url: 'https://edge1.radyotvonline.net/shoutcast/play/alemfm',
    url_resolved: 'https://edge1.radyotvonline.net/shoutcast/play/alemfm',
    homepage: 'https://www.alemfm.com',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
    tags: 'pop,sohbet,müzik,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 26500,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-number1-turk',
    name: 'Number1 Türk FM',
    playUrl: 'https://n10a-eu.superstream.com.tr/number1turk/playlist.m3u8',
    url: 'https://n10a-eu.superstream.com.tr/number1turk/playlist.m3u8',
    url_resolved: 'https://n10a-eu.superstream.com.tr/number1turk/playlist.m3u8',
    homepage: 'https://www.number1.com.tr',
    favicon: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80',
    tags: 'pop,turkce pop,top40',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 26000,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-kral-pop',
    name: 'Kral Pop',
    playUrl: 'https://ssldyg.radyotvonline.com/kralpop/kralpop.stream/playlist.m3u8',
    url: 'https://ssldyg.radyotvonline.com/kralpop/kralpop.stream/playlist.m3u8',
    url_resolved: 'https://ssldyg.radyotvonline.com/kralpop/kralpop.stream/playlist.m3u8',
    homepage: 'https://www.kralmuzik.com.tr',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'pop,turkce pop,top40',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 25800,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-istanbul-fm',
    name: 'İstanbul FM',
    playUrl: 'http://stream.istanbulfm.com.tr:8000/;',
    url: 'http://stream.istanbulfm.com.tr:8000/;',
    url_resolved: 'http://stream.istanbulfm.com.tr:8000/;',
    homepage: 'https://www.istanbulfm.com.tr',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'pop,turkce,hit',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 25500,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-radyo-45lik',
    name: "Radyo 45'lik",
    playUrl: 'https://edge1.radyotvonline.net/shoutcast/play/radyo45lik',
    url: 'https://edge1.radyotvonline.net/shoutcast/play/radyo45lik',
    url_resolved: 'https://edge1.radyotvonline.net/shoutcast/play/radyo45lik',
    homepage: 'https://www.radyo45lik.com',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
    tags: 'nostalji,pop,80s,90s,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 25000,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-trt-fm',
    name: 'TRT FM',
    playUrl: 'https://rd-trtfm.medya.trt.com.tr/master_128.m3u8',
    url: 'https://rd-trtfm.medya.trt.com.tr/master_128.m3u8',
    url_resolved: 'https://rd-trtfm.medya.trt.com.tr/master_128.m3u8',
    homepage: 'https://www.trtfm.com.tr',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'pop,top40,news,haber,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Ankara',
    language: 'turkish',
    votes: 24500,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-slow-turk',
    name: 'Slow Türk',
    playUrl: 'https://radyo.duhnet.tv/ak_dtvh_slowturk',
    url: 'https://radyo.duhnet.tv/ak_dtvh_slowturk',
    url_resolved: 'https://radyo.duhnet.tv/ak_dtvh_slowturk',
    homepage: 'https://www.slowturk.com.tr',
    favicon: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&q=80',
    tags: 'slow,love,ask,turkce slow',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 23500,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-joy-turk',
    name: 'JoyTürk',
    playUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC',
    url_resolved: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC',
    homepage: 'https://www.joyturk.com.tr',
    favicon: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&q=80',
    tags: 'slow,pop,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 23000,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-romantik-turk',
    name: 'Romantik Türk',
    playUrl: 'http://stream.romantikturk.com.tr:8032/;',
    url: 'http://stream.romantikturk.com.tr:8032/;',
    url_resolved: 'http://stream.romantikturk.com.tr:8032/;',
    homepage: 'https://www.romantikturk.com.tr',
    favicon: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&q=80',
    tags: 'slow,romantik,love',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Izmir',
    language: 'turkish',
    votes: 22500,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-powerturk-slow',
    name: 'PowerTürk Slow',
    playUrl: 'https://live.powerapp.com.tr/powerturkslow/abr/playlist.m3u8',
    url: 'https://live.powerapp.com.tr/powerturkslow/abr/playlist.m3u8',
    url_resolved: 'https://live.powerapp.com.tr/powerturkslow/abr/playlist.m3u8',
    homepage: 'https://www.powerapp.com.tr',
    favicon: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&q=80',
    tags: 'slow,pop,turkce slow,sanal',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 22000,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-kral-fm',
    name: 'Kral FM',
    playUrl: 'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8',
    url: 'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8',
    url_resolved: 'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8',
    homepage: 'https://www.kralmuzik.com.tr',
    favicon: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80',
    tags: 'arabesk,fantezi,damar,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 21500,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-baba-radyo',
    name: 'Baba Radyo',
    playUrl: 'https://live.radyositesihazir.com:10997/;',
    url: 'https://live.radyositesihazir.com:10997/;',
    url_resolved: 'https://live.radyositesihazir.com:10997/;',
    homepage: 'https://www.babaradyo.com',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'arabesk,fantezi,damar',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 21000,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-damar-fm',
    name: 'Damar FM',
    playUrl: 'http://stream.damarfm.com:8010/;',
    url: 'http://stream.damarfm.com:8010/;',
    url_resolved: 'http://stream.damarfm.com:8010/;',
    homepage: 'https://www.damarfm.com',
    favicon: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80',
    tags: 'arabesk,damar,fantezi',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 20500,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-trt-turku',
    name: 'TRT Türkü',
    playUrl: 'https://rd-trtturku.medya.trt.com.tr/master_128.m3u8',
    url: 'https://rd-trtturku.medya.trt.com.tr/master_128.m3u8',
    url_resolved: 'https://rd-trtturku.medya.trt.com.tr/master_128.m3u8',
    homepage: 'https://www.trtturku.com.tr',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'folk,turku,halk muzigi',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Ankara',
    language: 'turkish',
    votes: 20000,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-trt-nagme',
    name: 'TRT Nağme',
    playUrl: 'https://rd-trtnagme.medya.trt.com.tr/master_128.m3u8',
    url: 'https://rd-trtnagme.medya.trt.com.tr/master_128.m3u8',
    url_resolved: 'https://rd-trtnagme.medya.trt.com.tr/master_128.m3u8',
    homepage: 'https://www.trtnagme.com.tr',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'tsm,alaturka,fasıl',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Ankara',
    language: 'turkish',
    votes: 19500,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-diyanet-radyo',
    name: 'Diyanet Radyo',
    playUrl: 'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1171d7d2a.smil/playlist.m3u8',
    url: 'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1171d7d2a.smil/playlist.m3u8',
    url_resolved: 'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1171d7d2a.smil/playlist.m3u8',
    homepage: 'https://diyanetradyo.com',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'religious,dini,sohbet,kultur,islami',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Ankara',
    language: 'turkish',
    votes: 19000,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-trt-radyo-haber',
    name: 'TRT Radyo Haber',
    playUrl: 'https://rd-trthaber.medya.trt.com.tr/master_128.m3u8',
    url: 'https://rd-trthaber.medya.trt.com.tr/master_128.m3u8',
    url_resolved: 'https://rd-trthaber.medya.trt.com.tr/master_128.m3u8',
    homepage: 'https://www.trthaber.com',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'news,haber,spor',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Ankara',
    language: 'turkish',
    votes: 18500,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-trt-radyo-1',
    name: 'TRT Radyo 1',
    playUrl: 'https://rd-trtradyo1.medya.trt.com.tr/master_128.m3u8',
    url: 'https://rd-trtradyo1.medya.trt.com.tr/master_128.m3u8',
    url_resolved: 'https://rd-trtradyo1.medya.trt.com.tr/master_128.m3u8',
    homepage: 'https://www.trtradyo1.com.tr',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'news,haber,sohbet,kultur',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Ankara',
    language: 'turkish',
    votes: 18000,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-ntv-radyo',
    name: 'NTV Radyo',
    playUrl: 'https://dygedge2.radyotvonline.net/ntvradyo/playlist.m3u8',
    url: 'https://dygedge2.radyotvonline.net/ntvradyo/playlist.m3u8',
    url_resolved: 'https://dygedge2.radyotvonline.net/ntvradyo/playlist.m3u8',
    homepage: 'https://www.ntvradyo.com.tr',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'news,haber,ekonomi',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 17500,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-cnn-turk',
    name: 'CNN Türk Radyo',
    playUrl: 'https://radyo.duhnet.tv/ak_dtvh_cnnturkradyo',
    url: 'https://radyo.duhnet.tv/ak_dtvh_cnnturkradyo',
    url_resolved: 'https://radyo.duhnet.tv/ak_dtvh_cnnturkradyo',
    homepage: 'https://www.cnnturk.com',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'news,haber,gundem',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 17000,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-radyo-spor',
    name: 'Radyo Spor',
    playUrl: 'https://edge1.radyotvonline.net/shoutcast/play/radyospor',
    url: 'https://edge1.radyotvonline.net/shoutcast/play/radyospor',
    url_resolved: 'https://edge1.radyotvonline.net/shoutcast/play/radyospor',
    homepage: 'https://www.radyospor.com',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'spor,news,futbol',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 16500,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-virgin-radio',
    name: 'Virgin Radio Türkiye',
    playUrl: 'http://29103.live.streamtheworld.com/VIRGIN_RADIO_SC',
    url: 'http://29103.live.streamtheworld.com/VIRGIN_RADIO_SC',
    url_resolved: 'http://29103.live.streamtheworld.com/VIRGIN_RADIO_SC',
    homepage: 'https://www.karnaval.com/radyolar/virginradio',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
    tags: 'rap,rock,hiphop,hits',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'english',
    votes: 16000,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-radyo-eksen',
    name: 'Radyo Eksen',
    playUrl: 'https://dygedge2.radyotvonline.net/radyoeksen/playlist.m3u8',
    url: 'https://dygedge2.radyotvonline.net/radyoeksen/playlist.m3u8',
    url_resolved: 'https://dygedge2.radyotvonline.net/radyoeksen/playlist.m3u8',
    homepage: 'https://www.radioeksen.com',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
    tags: 'rock,indie,alternative',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'english',
    votes: 15500,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-metro-fm',
    name: 'Metro FM',
    playUrl: 'http://28503.live.streamtheworld.com:3690/METRO_FMAAC_SC',
    url: 'http://28503.live.streamtheworld.com:3690/METRO_FMAAC_SC',
    url_resolved: 'http://28503.live.streamtheworld.com:3690/METRO_FMAAC_SC',
    homepage: 'https://www.metrofm.com.tr',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
    tags: 'pop,foreign,hits,dance',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'english',
    votes: 15000,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-power-fm',
    name: 'Power FM',
    playUrl: 'https://live.powerapp.com.tr/powerfm/abr/powerfm/128/playlist.m3u8',
    url: 'https://live.powerapp.com.tr/powerfm/abr/powerfm/128/playlist.m3u8',
    url_resolved: 'https://live.powerapp.com.tr/powerfm/abr/powerfm/128/playlist.m3u8',
    homepage: 'https://www.powerapp.com.tr',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'pop,dance,hits,english',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'english',
    votes: 14500,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-joy-fm',
    name: 'Joy FM',
    playUrl: 'http://28993.live.streamtheworld.com:3690/JOY_FMAAC_SC',
    url: 'http://28993.live.streamtheworld.com:3690/JOY_FMAAC_SC',
    url_resolved: 'http://28993.live.streamtheworld.com:3690/JOY_FMAAC_SC',
    homepage: 'https://www.joyfm.com.tr',
    favicon: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&q=80',
    tags: 'slow,lounge,relax,foreign',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'english',
    votes: 14000,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-radyo-fenomen',
    name: 'Radyo Fenomen',
    playUrl: 'https://live.fenomenapp.com.tr/fenomen/abr/playlist.m3u8',
    url: 'https://live.fenomenapp.com.tr/fenomen/abr/playlist.m3u8',
    url_resolved: 'https://live.fenomenapp.com.tr/fenomen/abr/playlist.m3u8',
    homepage: 'https://www.radyofenomen.com',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
    tags: 'pop,dance,foreign,hits',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'english',
    votes: 13500,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-borusan-klasik',
    name: 'Borusan Klasik',
    playUrl: 'https://edge1.radyotvonline.net/shoutcast/play/borusanklasik',
    url: 'https://edge1.radyotvonline.net/shoutcast/play/borusanklasik',
    url_resolved: 'https://edge1.radyotvonline.net/shoutcast/play/borusanklasik',
    homepage: 'https://www.karnaval.com/radyolar/borusanklasik',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'classical,klasik,opera',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 13000,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-trt-radyo-3',
    name: 'TRT Radyo 3',
    playUrl: 'https://rd-trtradyo3.medya.trt.com.tr/master_128.m3u8',
    url: 'https://rd-trtradyo3.medya.trt.com.tr/master_128.m3u8',
    url_resolved: 'https://rd-trtradyo3.medya.trt.com.tr/master_128.m3u8',
    homepage: 'https://www.trtradyo3.com.tr',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'classical,klasik,jazz',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Ankara',
    language: 'turkish',
    votes: 12500,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-radyo-alaturka',
    name: 'Radyo Alaturka',
    playUrl: 'http://stream.radyoalaturka.com.tr:8032/;',
    url: 'http://stream.radyoalaturka.com.tr:8032/;',
    url_resolved: 'http://stream.radyoalaturka.com.tr:8032/;',
    homepage: 'https://www.radyoalaturka.com.tr',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'tsm,alaturka,turk sanat muzigi',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 12000,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-radyo-voyage',
    name: 'Radyo Voyage',
    playUrl: 'https://dygedge2.radyotvonline.net/radyovoyage/playlist.m3u8',
    url: 'https://dygedge2.radyotvonline.net/radyovoyage/playlist.m3u8',
    url_resolved: 'https://dygedge2.radyotvonline.net/radyovoyage/playlist.m3u8',
    homepage: 'https://www.radyovoyage.com',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'classical,klasik,ambient,chillout,newage,instrumental,relax,voyage',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 28000,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-joyturk-akustik',
    name: 'JoyTürk Akustik',
    playUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_AKUSTIK_SC',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_AKUSTIK_SC',
    url_resolved: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_AKUSTIK_SC',
    homepage: 'https://www.karnaval.com/radyolar/joyturkakustik',
    favicon: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&q=80',
    tags: 'slow,akustik,turkce,sanal',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 11800,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-pal-fm',
    name: 'Pal FM',
    playUrl: 'https://shoutcast.palmedya.com.tr/palfm/stream',
    url: 'https://shoutcast.palmedya.com.tr/palfm/stream',
    url_resolved: 'https://shoutcast.palmedya.com.tr/palfm/stream',
    homepage: 'https://www.palfm.com.tr',
    favicon: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80',
    tags: 'pop,turkce pop,top40',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 11500,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-pal-station',
    name: 'Pal Station',
    playUrl: 'https://shoutcast.palmedya.com.tr/palstation/stream',
    url: 'https://shoutcast.palmedya.com.tr/palstation/stream',
    url_resolved: 'https://shoutcast.palmedya.com.tr/palstation/stream',
    homepage: 'https://www.palstation106.com',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
    tags: 'yabanci,pop,dance,hits',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'english',
    votes: 11200,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-radyo-trafik',
    name: 'Radyo Trafik İstanbul',
    playUrl: 'https://edge1.radyotvonline.net/shoutcast/play/radyotrafik',
    url: 'https://edge1.radyotvonline.net/shoutcast/play/radyotrafik',
    url_resolved: 'https://edge1.radyotvonline.net/shoutcast/play/radyotrafik',
    homepage: 'https://www.radyotrafik.com',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'news,haber,trafik,gundem',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 11000,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-a-haber-radyo',
    name: 'A Haber Radyo',
    playUrl: 'https://turkmedya.radyotvonline.net/ahaberaac',
    url: 'https://turkmedya.radyotvonline.net/ahaberaac',
    url_resolved: 'https://turkmedya.radyotvonline.net/ahaberaac',
    homepage: 'https://www.ahaber.com.tr',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'news,haber,gundem',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 10800,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-bloomberg-ht',
    name: 'Bloomberg HT Radyo',
    playUrl: 'https://ciner.radyotvonline.net/bloomberghtradyo',
    url: 'https://ciner.radyotvonline.net/bloomberghtradyo',
    url_resolved: 'https://ciner.radyotvonline.net/bloomberghtradyo',
    homepage: 'https://www.bloomberght.com',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'news,haber,ekonomi,finans',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 10500,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-lalegul-fm',
    name: 'Lalegül FM',
    playUrl: 'http://stream.lalegulfm.com.tr:8000/;',
    url: 'http://stream.lalegulfm.com.tr:8000/;',
    url_resolved: 'http://stream.lalegulfm.com.tr:8000/;',
    homepage: 'https://www.lalegulfm.com.tr',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'islamic,dini,sohbet,tasavvuf',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 10200,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-semerkand-radyo',
    name: 'Semerkand Radyo',
    playUrl: 'https://stream.semerkandradyo.com:8000/;',
    url: 'https://stream.semerkandradyo.com:8000/;',
    url_resolved: 'https://stream.semerkandradyo.com:8000/;',
    homepage: 'https://www.semerkandradyo.com',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'islamic,dini,sohbet,tasavvuf',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 10000,
    codec: 'MP3',
    bitrate: 128
  }
];

// Fallback mirror map by station name / keyword
export const STATION_MIRRORS_MAP: Record<string, string[]> = {
  'kralpop': [
    'https://dygedge2.radyotvonline.net/kralpop/playlist.m3u8',
    'https://ssldyg.radyotvonline.com/kralpop/kralpop.stream/playlist.m3u8',
    'https://live.kralmuzik.com.tr/kralpop/playlist.m3u8',
    'https://showradyo.radyotvonline.net/kralpop'
  ],
  'kral pop': [
    'https://dygedge2.radyotvonline.net/kralpop/playlist.m3u8',
    'https://ssldyg.radyotvonline.com/kralpop/kralpop.stream/playlist.m3u8',
    'https://live.kralmuzik.com.tr/kralpop/playlist.m3u8',
    'https://showradyo.radyotvonline.net/kralpop'
  ],
  'kralfm': [
    'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8',
    'https://ssldyg.radyotvonline.com/kralfm/kralfm.stream/playlist.m3u8',
    'https://live.kralmuzik.com.tr/kralfm/playlist.m3u8'
  ],
  'kral fm': [
    'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8',
    'https://ssldyg.radyotvonline.com/kralfm/kralfm.stream/playlist.m3u8',
    'https://live.kralmuzik.com.tr/kralfm/playlist.m3u8'
  ],
  'radyo voyage': [
    'https://dygedge2.radyotvonline.net/radyovoyage/playlist.m3u8',
    'https://ssldyg.radyotvonline.com/radyovoyage/radyovoyage.stream/playlist.m3u8'
  ],
  'voyage': [
    'https://dygedge2.radyotvonline.net/radyovoyage/playlist.m3u8',
    'https://ssldyg.radyotvonline.com/radyovoyage/radyovoyage.stream/playlist.m3u8'
  ],
  'kafa radyo': [
    'https://edge1.radyotvonline.net/shoutcast/play/kafaradyo',
    'https://moondigitalmaster.radyotvonline.net/kafaradyo/playlist.m3u8',
    'https://listen.kafaradyo.com/stream'
  ],
  'kafaradyo': [
    'https://edge1.radyotvonline.net/shoutcast/play/kafaradyo',
    'https://moondigitalmaster.radyotvonline.net/kafaradyo/playlist.m3u8'
  ],
  'super fm': [
    'https://29103.live.streamtheworld.com/SUPER_FM_SC',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/SUPER_FM_SC',
    'http://stream.super.fm:8000/superfm.mp3'
  ],
  'superfm': [
    'https://29103.live.streamtheworld.com/SUPER_FM_SC',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/SUPER_FM_SC'
  ],
  'alem fm': [
    'https://edge1.radyotvonline.net/shoutcast/play/alemfm',
    'https://turkmedya.radyotvonline.net/alemfmaac',
    'http://turkmedya.radyotvonline.com/turkmedya/alemfm.stream/playlist.m3u8'
  ],
  'alemfm': [
    'https://edge1.radyotvonline.net/shoutcast/play/alemfm',
    'https://turkmedya.radyotvonline.net/alemfmaac'
  ],
  'trt fm': [
    'https://rd-trtfm.medya.trt.com.tr/master_128.m3u8',
    'https://trt.radyotvonline.net/trtfm'
  ],
  'trtfm': [
    'https://rd-trtfm.medya.trt.com.tr/master_128.m3u8',
    'https://trt.radyotvonline.net/trtfm'
  ],
  'virgin radio': [
    'https://29103.live.streamtheworld.com/VIRGIN_RADIO_SC',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/VIRGIN_RADIO_SC'
  ],
  'power fm': [
    'https://live.powerapp.com.tr/powerfm/abr/powerfm/128/playlist.m3u8',
    'https://powerfm.listenpowerapp.com/powerfm/mpeg/icecast.audio'
  ],
  'powerfm': [
    'https://live.powerapp.com.tr/powerfm/abr/powerfm/128/playlist.m3u8'
  ],
  'power turk': [
    'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    'https://listen.powerapp.com.tr/powerturk/abr/playlist.m3u8'
  ],
  'powerturk': [
    'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    'https://listen.powerapp.com.tr/powerturk/abr/playlist.m3u8'
  ],
  'slow turk': [
    'https://radyo.duhnet.tv/ak_dtvh_slowturk',
    'https://kanald.radyotvonline.net/slowturk'
  ],
  'slowturk': [
    'https://radyo.duhnet.tv/ak_dtvh_slowturk',
    'https://kanald.radyotvonline.net/slowturk'
  ],
  'show radyo': [
    'https://showradyo.radyotvonline.net/showradyo',
    'http://showradyo.radyotvonline.net/showradyoaac/'
  ],
  'showradyo': [
    'https://showradyo.radyotvonline.net/showradyo'
  ],
  'joy fm': [
    'https://28993.live.streamtheworld.com/JOY_FMAAC_SC',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_FMAAC_SC'
  ],
  'joy turk': [
    'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_ITUNES.mp3'
  ],
  'joyturk': [
    'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC'
  ],
  'metro fm': [
    'https://28503.live.streamtheworld.com/METRO_FMAAC_SC',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FMAAC_SC'
  ],
  'metrofm': [
    'https://28503.live.streamtheworld.com/METRO_FMAAC_SC'
  ],
  'radyo d': [
    'https://moondigitaledge2.radyotvonline.net/radyod/playlist.m3u8',
    'https://radyo.duhnet.tv/ak_dtvh_radyod'
  ],
  'radyod': [
    'https://moondigitaledge2.radyotvonline.net/radyod/playlist.m3u8'
  ],
  'best fm': [
    'https://ssldyg.radyotvonline.com/best/bestfm.stream/playlist.m3u8',
    'https://hepsibest.radyotvonline.net/bestslow'
  ],
  'bestfm': [
    'https://ssldyg.radyotvonline.com/best/bestfm.stream/playlist.m3u8'
  ],
  'diyanet radyo': [
    'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1171d7d2a.smil/playlist.m3u8'
  ],
  'trt turku': [
    'https://rd-trtturku.medya.trt.com.tr/master_128.m3u8'
  ],
  'number1': [
    'https://n10a-eu.superstream.com.tr/number1turk/playlist.m3u8',
    'https://n10a-eu.superstream.com.tr/number1/playlist.m3u8'
  ],
  'pal fm': [
    'https://shoutcast.palmedya.com.tr/palfm/stream'
  ],
  'pal station': [
    'https://shoutcast.palmedya.com.tr/palstation/stream'
  ]
};

/**
 * Returns candidate stream URLs for a station name or station object
 */
export function getCandidateUrlsForStation(station: RadioStation): string[] {
  const candidates: string[] = [];
  const primary = station.url_resolved || station.url || station.playUrl || station.streamUrl;
  if (primary) candidates.push(primary.trim());

  const rawName = (station.name || '').toLowerCase();
  const normalizedName = rawName
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .trim();

  const cleanName = normalizedName.replace(/[^a-z0-9]/g, '');

  for (const [key, mirrors] of Object.entries(STATION_MIRRORS_MAP)) {
    const cleanKey = key
      .toLowerCase()
      .replace(/ç/g, 'c')
      .replace(/ğ/g, 'g')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ş/g, 's')
      .replace(/ü/g, 'u')
      .replace(/[^a-z0-9]/g, '');

    if (
      normalizedName.includes(key) ||
      (cleanKey.length >= 3 && cleanName.includes(cleanKey))
    ) {
      for (const m of mirrors) {
        if (m && !candidates.includes(m.trim())) {
          candidates.push(m.trim());
        }
      }
    }
  }

  // Also try backup URL if primary is http and can be https or vice versa
  if (primary) {
    const trimmedPrimary = primary.trim();
    if (trimmedPrimary.startsWith('http://')) {
      const httpsVersion = trimmedPrimary.replace(/^http:\/\//i, 'https://');
      if (!candidates.includes(httpsVersion)) candidates.push(httpsVersion);
    } else if (trimmedPrimary.startsWith('https://')) {
      const httpVersion = trimmedPrimary.replace(/^https:\/\//i, 'http://');
      if (!candidates.includes(httpVersion)) candidates.push(httpVersion);
    }
  }

  return candidates;
}
