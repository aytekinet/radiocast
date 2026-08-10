import { PodcastEpisode } from '../types';

export interface DownloadedEpisodeRecord {
  id: string; // episode.id
  episode: PodcastEpisode;
  sizeBytes: number;
  downloadedAt: number;
  blob: Blob;
}

export interface ActiveDownloadState {
  episodeId: string;
  episode: PodcastEpisode;
  progressPct: number; // 0 - 100
  downloadedBytes: number;
  totalBytes: number;
  error?: string;
}

const DB_NAME = 'RadioCastOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'downloaded_episodes';

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      dbPromise = null;
      reject(request.error);
    };
  });

  return dbPromise;
}

// Global active downloads tracking
const activeDownloads = new Map<string, ActiveDownloadState>();
const abortControllersMap = new Map<string, AbortController>();

export function cancelDownloadEpisode(episodeId: string): void {
  const controller = abortControllersMap.get(episodeId);
  if (controller) {
    try {
      controller.abort();
    } catch {
      // ignore
    }
    abortControllersMap.delete(episodeId);
  }
  const existing = activeDownloads.get(episodeId);
  activeDownloads.delete(episodeId);
  
  if (existing) {
    notifyDownloadProgress(episodeId, {
      episodeId,
      episode: existing.episode,
      progressPct: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      error: 'İndirme durduruldu'
    });
  }
}

export function getActiveDownloadsMap(): Map<string, ActiveDownloadState> {
  return activeDownloads;
}

export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function notifyDownloadChange(episodeId: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('offlineEpisodesChanged', { detail: { episodeId } }));
  }
}

function notifyDownloadProgress(episodeId: string, state: ActiveDownloadState) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('downloadProgressChanged', { detail: { episodeId, state } }));
  }
}

/**
 * Check if episode is downloaded in IndexedDB
 */
export async function isEpisodeDownloaded(episodeId: string): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(episodeId);
      req.onsuccess = () => {
        resolve(!!req.result);
      };
      req.onerror = () => {
        resolve(false);
      };
    });
  } catch {
    return false;
  }
}

/**
 * Get downloaded record (with blob & metadata)
 */
export async function getDownloadedRecord(episodeId: string): Promise<DownloadedEpisodeRecord | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(episodeId);
      req.onsuccess = () => {
        resolve(req.result || null);
      };
      req.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Get Blob Object URL for playing offline audio
 */
export async function getOfflineAudioUrl(episodeId: string): Promise<string | null> {
  const record = await getDownloadedRecord(episodeId);
  if (!record || !record.blob) return null;
  try {
    return URL.createObjectURL(record.blob);
  } catch (err) {
    console.error('Failed to create ObjectURL for offline blob', err);
    return null;
  }
}

/**
 * Get all downloaded episodes list (without loading full blobs into memory at once)
 */
export async function getAllDownloadedEpisodes(): Promise<{ episode: PodcastEpisode; sizeBytes: number; downloadedAt: number }[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = (req.result || []).map((item: DownloadedEpisodeRecord) => ({
          episode: item.episode,
          sizeBytes: item.sizeBytes || item.blob?.size || 0,
          downloadedAt: item.downloadedAt || Date.now()
        }));
        results.sort((a, b) => b.downloadedAt - a.downloadedAt);
        resolve(results);
      };
      req.onerror = () => {
        resolve([]);
      };
    });
  } catch {
    return [];
  }
}

/**
 * Get total offline storage size used
 */
export async function getTotalOfflineStorageUsed(): Promise<{ totalBytes: number; formattedSize: string; count: number }> {
  const items = await getAllDownloadedEpisodes();
  const totalBytes = items.reduce((acc, item) => acc + (item.sizeBytes || 0), 0);
  return {
    totalBytes,
    formattedSize: formatBytes(totalBytes),
    count: items.length
  };
}

/**
 * Delete a downloaded episode from IndexedDB
 */
export async function deleteDownloadedEpisode(episodeId: string): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(episodeId);
      req.onsuccess = () => {
        notifyDownloadChange(episodeId);
        resolve(true);
      };
      req.onerror = () => {
        resolve(false);
      };
    });
  } catch {
    return false;
  }
}

/**
 * Clear all downloaded episodes from IndexedDB
 */
export async function clearAllDownloadedEpisodes(): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => {
        notifyDownloadChange('all');
        resolve(true);
      };
      req.onerror = () => {
        resolve(false);
      };
    });
  } catch {
    return false;
  }
}

/**
 * Download podcast episode audio file to IndexedDB with progress stream
 */
export async function downloadPodcastEpisode(
  episode: PodcastEpisode,
  onProgress?: (state: ActiveDownloadState) => void
): Promise<boolean> {
  const episodeId = episode.id;

  // If already downloaded, return true
  if (await isEpisodeDownloaded(episodeId)) {
    return true;
  }

  // If already downloading, don't trigger duplicate
  if (activeDownloads.has(episodeId)) {
    return false;
  }

  const initialState: ActiveDownloadState = {
    episodeId,
    episode,
    progressPct: 0,
    downloadedBytes: 0,
    totalBytes: 0
  };

  const controller = new AbortController();
  abortControllersMap.set(episodeId, controller);

  activeDownloads.set(episodeId, initialState);
  notifyDownloadProgress(episodeId, initialState);
  if (onProgress) onProgress(initialState);

  const cleanUrl = (episode.audioUrl || '').trim();
  const proxyUrl = `/api/radio/proxy?url=${encodeURIComponent(cleanUrl)}`;
  const httpsUrl = cleanUrl.startsWith('http://') ? cleanUrl.replace(/^http:\/\//i, 'https://') : '';
  const candidateUrls = [
    proxyUrl,
    cleanUrl,
    httpsUrl
  ].filter((u, i, self) => u && self.indexOf(u) === i);

  let blob: Blob | null = null;
  let totalSize = 0;
  let lastErr = '';

  try {
    for (const fetchUrl of candidateUrls) {
      if (controller.signal.aborted) break;
      try {
        const response = await fetch(fetchUrl, { signal: controller.signal });
        if (!response.ok) {
          lastErr = `HTTP ${response.status} ${response.statusText}`;
          continue;
        }

        const contentLengthHeader = response.headers.get('content-length');
        totalSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) || 0 : 0;

        if (!response.body) {
          // Fallback arrayBuffer if body stream not available
          const buf = await response.arrayBuffer();
          if (controller.signal.aborted) break;
          blob = new Blob([buf], { type: response.headers.get('content-type') || 'audio/mpeg' });
          totalSize = blob.size;
          break;
        }

        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let receivedBytes = 0;

        while (true) {
          if (controller.signal.aborted) break;
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          receivedBytes += value.length;

          const pct = totalSize > 0 ? Math.min(99, Math.round((receivedBytes / totalSize) * 100)) : 50;

          const progressState: ActiveDownloadState = {
            episodeId,
            episode,
            progressPct: pct,
            downloadedBytes: receivedBytes,
            totalBytes: totalSize || receivedBytes
          };

          activeDownloads.set(episodeId, progressState);
          notifyDownloadProgress(episodeId, progressState);
          if (onProgress) onProgress(progressState);
        }

        if (controller.signal.aborted) break;

        blob = new Blob(chunks, { type: response.headers.get('content-type') || 'audio/mpeg' });
        totalSize = blob.size;
        break;
      } catch (err: any) {
        if (err?.name === 'AbortError' || controller.signal.aborted) {
          lastErr = 'İndirme iptal edildi';
          break;
        }
        lastErr = err?.message || 'İndirme hatası';
      }
    }
  } finally {
    abortControllersMap.delete(episodeId);
  }

  if (!blob || blob.size === 0) {
    const errorState: ActiveDownloadState = {
      episodeId,
      episode,
      progressPct: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      error: lastErr || 'Ses dosyası indirilemedi. İnternet bağlantısını kontrol edin.'
    };
    activeDownloads.delete(episodeId);
    notifyDownloadProgress(episodeId, errorState);
    if (onProgress) onProgress(errorState);
    return false;
  }

  // Save blob to IndexedDB
  try {
    const db = await getDB();
    const record: DownloadedEpisodeRecord = {
      id: episodeId,
      episode,
      sizeBytes: totalSize,
      downloadedAt: Date.now(),
      blob
    };

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });

    const finishState: ActiveDownloadState = {
      episodeId,
      episode,
      progressPct: 100,
      downloadedBytes: totalSize,
      totalBytes: totalSize
    };

    activeDownloads.delete(episodeId);
    notifyDownloadProgress(episodeId, finishState);
    notifyDownloadChange(episodeId);
    if (onProgress) onProgress(finishState);

    return true;
  } catch (err: any) {
    console.error('Failed to store blob in IndexedDB:', err);
    activeDownloads.delete(episodeId);
    notifyDownloadProgress(episodeId, {
      episodeId,
      episode,
      progressPct: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      error: 'Yerel depolama alanına kaydedilemedi.'
    });
    return false;
  }
}
