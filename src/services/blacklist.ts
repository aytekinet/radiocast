import { RadioStation, PodcastEpisode } from '../types';

export interface BlacklistEntry {
  id: string;
  contentType: 'radio_station' | 'podcast' | 'podcast_episode' | 'stream_host' | 'feed_host';
  stationId?: string;
  podcastId?: string;
  episodeGuid?: string;
  streamUrls?: string[];
  feedUrl?: string;
  hostnames?: string[];
  displayName?: string;
  reasonCode?: string;
  active: boolean;
}

let blacklistCache: BlacklistEntry[] = [];
let isLoaded = false;

export async function loadBlacklist(): Promise<BlacklistEntry[]> {
  if (isLoaded) return blacklistCache;
  try {
    const res = await fetch('/data/content-blacklist.json');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.entries)) {
        blacklistCache = data.entries.filter((e: any) => e && e.active !== false);
      }
    }
  } catch {
    // If fetch fails, keep cache empty
  }
  isLoaded = true;
  return blacklistCache;
}

export function isStationBlocked(station: Partial<RadioStation>, blacklist: BlacklistEntry[] = blacklistCache): boolean {
  if (!station) return false;
  const sId = station.id || station.stationuuid;
  const sUrls = [
    station.playUrl,
    station.url_resolved,
    station.url,
    station.streamUrl
  ].filter((u): u is string => Boolean(u && u.trim()));

  for (const entry of blacklist) {
    if (entry.active === false) continue;

    // Check Station ID / UUID match
    if (entry.stationId && sId && entry.stationId.toLowerCase() === sId.toLowerCase()) {
      return true;
    }

    // Check Stream URL match
    if (entry.streamUrls && entry.streamUrls.length > 0 && sUrls.length > 0) {
      for (const entryUrl of entry.streamUrls) {
        for (const sUrl of sUrls) {
          if (sUrl.toLowerCase().includes(entryUrl.toLowerCase())) {
            return true;
          }
        }
      }
    }

    // Check Hostname match
    if (entry.hostnames && entry.hostnames.length > 0 && sUrls.length > 0) {
      for (const host of entry.hostnames) {
        for (const sUrl of sUrls) {
          if (sUrl.toLowerCase().includes(host.toLowerCase())) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

export function isPodcastBlocked(podcast: any, blacklist: BlacklistEntry[] = blacklistCache): boolean {
  if (!podcast) return false;
  const pId = podcast.id || podcast.collectionId;
  const feedUrl = podcast.feedUrl || '';

  for (const entry of blacklist) {
    if (entry.active === false) continue;

    if (entry.podcastId && pId && String(entry.podcastId).toLowerCase() === String(pId).toLowerCase()) {
      return true;
    }

    if (entry.feedUrl && feedUrl && feedUrl.toLowerCase().includes(entry.feedUrl.toLowerCase())) {
      return true;
    }
  }

  return false;
}

export function isEpisodeBlocked(episode: Partial<PodcastEpisode>, blacklist: BlacklistEntry[] = blacklistCache): boolean {
  if (!episode) return false;
  const epId = episode.id;

  for (const entry of blacklist) {
    if (entry.active === false) continue;

    if (entry.episodeGuid && epId && entry.episodeGuid.toLowerCase() === epId.toLowerCase()) {
      return true;
    }
  }

  return false;
}
