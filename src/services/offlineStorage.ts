import { PodcastEpisode } from '../types';

export interface DownloadedEpisodeRecord {
  id: string; // episode.id
  episode: PodcastEpisode;
  sizeBytes: number;
  downloadedAt: number;
  blob?: Blob;
  arrayBuffer?: ArrayBuffer;
  mimeType?: string;
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
  if (!record) return null;
  try {
    let finalBlob: Blob | null = null;
    if (record.blob && record.blob instanceof Blob && record.blob.size > 0) {
      finalBlob = record.blob;
    } else if (record.arrayBuffer && record.arrayBuffer.byteLength > 0) {
      finalBlob = new Blob([record.arrayBuffer], { type: record.mimeType || 'audio/mpeg' });
    }
    if (!finalBlob) return null;
    return URL.createObjectURL(finalBlob);
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
          sizeBytes: item.sizeBytes || item.blob?.size || item.arrayBuffer?.byteLength || 0,
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

  const rawUrl = (episode.audioUrl || '').trim().replace(/&amp;/g, '&');
  const cleanUrl = rawUrl.startsWith('http://') ? rawUrl.replace(/^http:\/\//i, 'https://') : rawUrl;
  const proxyUrl = rawUrl.startsWith('/api/') ? rawUrl : `/api/radio/proxy?url=${encodeURIComponent(rawUrl)}`;
  const candidateUrls = [
    proxyUrl,
    cleanUrl,
    rawUrl
  ].filter((u, i, self) => u && self.indexOf(u) === i);

  let blob: Blob | null = null;
  let totalSize = 0;
  let lastErr = '';

  try {
    for (const fetchUrl of candidateUrls) {
      if (controller.signal.aborted) break;
      
      try {
        // Use XMLHttpRequest for solid, cross-platform progress and arraybuffer/blob handling on iOS Safari
        const downloadedResult = await new Promise<{ blob: Blob; size: number }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', fetchUrl, true);
          xhr.timeout = 300000; // 5 minutes timeout for downloading audio files
          const isIOSDevice = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent || '');
          xhr.responseType = isIOSDevice ? 'arraybuffer' : 'blob';

          const onAbort = () => {
            xhr.abort();
            reject(new Error('İndirme iptal edildi'));
          };

          if (controller.signal.aborted) {
            return reject(new Error('İndirme iptal edildi'));
          }

          controller.signal.addEventListener('abort', onAbort);

          xhr.onprogress = (e) => {
            if (controller.signal.aborted) return;
            const loaded = e.loaded || 0;
            const total = e.lengthComputable && e.total > 0 ? e.total : 0;
            const pct = total > 0 
              ? Math.min(99, Math.round((loaded / total) * 100)) 
              : Math.min(98, Math.round((loaded / (20 * 1024 * 1024)) * 100));

            const progressState: ActiveDownloadState = {
              episodeId,
              episode,
              progressPct: pct,
              downloadedBytes: loaded,
              totalBytes: total || loaded
            };

            activeDownloads.set(episodeId, progressState);
            notifyDownloadProgress(episodeId, progressState);
            if (onProgress) onProgress(progressState);
          };

          xhr.onload = () => {
            controller.signal.removeEventListener('abort', onAbort);
            if (xhr.status >= 200 && xhr.status < 300) {
              const contentType = (xhr.getResponseHeader('content-type') || '').toLowerCase();
              if (contentType.includes('text/html') || contentType.includes('application/json')) {
                reject(new Error('Gelen yanıt ses dosyası değil (Web sayfası döndü)'));
                return;
              }

              let resultBlob: Blob | null = null;
              if (xhr.response instanceof ArrayBuffer) {
                resultBlob = new Blob([xhr.response], { type: contentType || 'audio/mpeg' });
              } else if (xhr.response instanceof Blob) {
                resultBlob = xhr.response;
              }

              if (!resultBlob || resultBlob.size < 2000) {
                reject(new Error('İndirilen ses verisi çok küçük veya geçersiz'));
                return;
              }

              resolve({ blob: resultBlob, size: resultBlob.size });
            } else {
              reject(new Error(`HTTP ${xhr.status} ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => {
            controller.signal.removeEventListener('abort', onAbort);
            reject(new Error('Ağ hatası'));
          };

          xhr.ontimeout = () => {
            controller.signal.removeEventListener('abort', onAbort);
            reject(new Error('Zaman aşımı'));
          };

          xhr.send();
        });

        if (downloadedResult && downloadedResult.blob && downloadedResult.blob.size > 0) {
          blob = downloadedResult.blob;
          totalSize = downloadedResult.size;
          break;
        }
      } catch (xhrErr: any) {
        if (controller.signal.aborted) {
          lastErr = 'İndirme iptal edildi';
          break;
        }

        // Direct Fetch Fallback if XHR fails
        try {
          const res = await fetch(fetchUrl, { signal: controller.signal });
          if (res.ok) {
            const directBlob = await res.blob();
            if (directBlob && directBlob.size > 0) {
              blob = directBlob;
              totalSize = directBlob.size;
              break;
            }
          } else {
            lastErr = `HTTP ${res.status}`;
          }
        } catch (fetchErr: any) {
          lastErr = fetchErr?.message || xhrErr?.message || 'İndirme hatası';
        }
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

  // Save blob or arrayBuffer to IndexedDB
  try {
    const mimeType = blob.type || 'audio/mpeg';
    let savedSuccessfully = false;

    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent || '');

    // iOS Safari Safari DataCloneError workaround: prefer ArrayBuffer directly
    if (isIOS) {
      try {
        const arrayBuffer = await blob.arrayBuffer();
        const record: DownloadedEpisodeRecord = {
          id: episodeId,
          episode,
          sizeBytes: totalSize,
          downloadedAt: Date.now(),
          arrayBuffer,
          mimeType
        };
        const db = await getDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(record);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
        savedSuccessfully = true;
      } catch (iosErr) {
        console.warn('iOS ArrayBuffer IndexedDB put failed, trying standard blob:', iosErr);
      }
    }

    if (!savedSuccessfully) {
      const db = await getDB();
      // First attempt: Store directly as Blob
      try {
        const record: DownloadedEpisodeRecord = {
          id: episodeId,
          episode,
          sizeBytes: totalSize,
          downloadedAt: Date.now(),
          blob,
          mimeType
        };

        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(record);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
        savedSuccessfully = true;
      } catch (blobSaveErr) {
        console.warn('Direct Blob put failed in IndexedDB, trying ArrayBuffer fallback:', blobSaveErr);
      }

      // Second attempt: Convert to ArrayBuffer for compatibility
      if (!savedSuccessfully) {
        const arrayBuffer = await blob.arrayBuffer();
        const record: DownloadedEpisodeRecord = {
          id: episodeId,
          episode,
          sizeBytes: totalSize,
          downloadedAt: Date.now(),
          arrayBuffer,
          mimeType
        };

        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(record);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    }

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
    console.error('Failed to store episode in IndexedDB:', err);
    activeDownloads.delete(episodeId);
    notifyDownloadProgress(episodeId, {
      episodeId,
      episode,
      progressPct: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      error: 'Yerel depolama alanına kaydedilemedi: ' + (err?.message || 'iOS Hafıza Hatası')
    });
    return false;
  }
}
