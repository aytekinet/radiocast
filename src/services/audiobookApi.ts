import { Audiobook, AudiobookTrack } from '../types';

export async function getAudiobooks(page = 1): Promise<Audiobook[]> {
  try {
    const res = await fetch(`/api/audiobooks?page=${page}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('Failed to fetch audiobooks:', err);
  }
  return FALLBACK_AUDIOBOOKS;
}

export async function searchAudiobooks(query: string, page = 1): Promise<Audiobook[]> {
  if (!query.trim()) return getAudiobooks(page);

  try {
    const res = await fetch(`/api/audiobooks/search?q=${encodeURIComponent(query)}&page=${page}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('Audiobook search error:', err);
  }

  return FALLBACK_AUDIOBOOKS.filter(b =>
    b.title.toLowerCase().includes(query.toLowerCase()) ||
    b.authors.toLowerCase().includes(query.toLowerCase())
  );
}

export async function getAudiobookTracks(bookId: string): Promise<AudiobookTrack[]> {
  try {
    const res = await fetch(`/api/audiobooks/tracks?id=${encodeURIComponent(bookId)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn('Failed to fetch audiobook tracks:', err);
  }

  return [
    {
      id: `${bookId}-tr1`,
      sectionNumber: 1,
      title: 'Bölüm 1 - Giriş ve Başlangıç',
      listenUrl: 'https://www.archive.org/download/alice_in_wonderland_librivox/wonderland_01_carroll.mp3',
      durationSeconds: 720
    },
    {
      id: `${bookId}-tr2`,
      sectionNumber: 2,
      title: 'Bölüm 2 - Tavşan Deliği ve Yeni Dünya',
      listenUrl: 'https://www.archive.org/download/alice_in_wonderland_librivox/wonderland_02_carroll.mp3',
      durationSeconds: 840
    }
  ];
}

const FALLBACK_AUDIOBOOKS: Audiobook[] = [
  {
    id: 'librivox-1',
    title: 'Alice Harikalar Diyarında (Public Domain)',
    description: 'Lewis Carroll tarafından yazılan dünya klasiği çocuk ve felsefe eseri.',
    language: 'English',
    authors: 'Lewis Carroll',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    totalTime: '02:45:00',
    totalTimeSeconds: 9900
  },
  {
    id: 'librivox-2',
    title: 'İki Şehrin Hikayesi',
    description: 'Charles Dickens’ın Fransız İhtilali dönemini anlatan ölümsüz eseri.',
    language: 'English',
    authors: 'Charles Dickens',
    cover: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80',
    totalTime: '12:30:00',
    totalTimeSeconds: 45000
  }
];
