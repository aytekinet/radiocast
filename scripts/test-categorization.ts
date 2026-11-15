import assert from 'node:assert/strict';
import { ALL_TURKISH_STATIONS, getCandidateUrlsForStation } from '../src/data/fallbackStations';
import {
  GENRE_CATEGORIES,
  SUBCATEGORIES,
  matchesCategory,
  getSubcategoriesForGroup,
  getParentGroupId
} from '../src/constants/categories';
import { getEditorialPriorityStations } from '../src/constants/priorityStations';
import type { RadioStation } from '../src/types';

console.log('--- RadioCast Categorization & Popüler İlk 20 Test Suite ---');

// 1. Verify every station in ALL_TURKISH_STATIONS has categoryGroupId, categoryGroup, mainCategory, and candidate URLs
assert.ok(ALL_TURKISH_STATIONS.length >= 600, `Expected >= 600 stations, got ${ALL_TURKISH_STATIONS.length}`);
for (const s of ALL_TURKISH_STATIONS) {
  assert.ok(s.mainCategory, `Missing mainCategory on ${s.name}`);
  assert.ok(s.categoryGroup, `Missing categoryGroup on ${s.name}`);
  assert.ok(s.categoryGroupId, `Missing categoryGroupId on ${s.name}`);
  const urls = getCandidateUrlsForStation(s);
  assert.ok(urls.length > 0, `No playable URLs on ${s.name}`);
}
console.log(`✓ All ${ALL_TURKISH_STATIONS.length} stations have mainCategory, categoryGroup, categoryGroupId, and valid URLs`);

// 2. Verify Popüler İlk 20 matches exact TXT ranks 1..20
const expectedTop20 = [
  'Kral FM',
  'Kral Pop',
  'TRT FM',
  'Radyo 7',
  'Virgin Radio Türkiye',
  'Süper FM',
  'Slow Türk',
  'Radyo Seymen',
  'PowerTürk',
  "Radyo 45'lik",
  'Kafa Radyo',
  'Kalp FM',
  'Alem FM',
  'Power FM',
  'Show Radyo',
  'Radyo Turkuvaz',
  'Best FM',
  'Joy Türk',
  'Metro FM',
  'Radyo D'
];

const priorityList = getEditorialPriorityStations();
assert.equal(priorityList.length, 20, 'Editorial priority list must have exactly 20 stations');
priorityList.forEach((st, idx) => {
  assert.equal(st.popularRank, idx + 1, `Rank mismatch at index ${idx}`);
  assert.equal(st.name, expectedTop20[idx], `Name mismatch at rank ${idx + 1}`);
  const urls = getCandidateUrlsForStation(st);
  assert.ok(urls.length > 0, `Popüler #${idx + 1} (${st.name}) must have stream URLs`);
});

const popFiltered = ALL_TURKISH_STATIONS
  .filter((s) => matchesCategory(s, 'populer'))
  .sort((a, b) => (a.popularRank ?? 999) - (b.popularRank ?? 999));
assert.equal(popFiltered.length, 20, `Expected 20 popular stations in catalog filter, got ${popFiltered.length}`);
console.log('✓ Popüler İlk 20 verified (20/20 ranked 1..20 with verified streams)');

// 3. Verify 13 group categories partition ALL_TURKISH_STATIONS cleanly (exact sum === ALL_TURKISH_STATIONS.length, zero overlap/leakage!)
const groupCats = GENRE_CATEGORIES.filter((c) => c.id !== 'all' && c.id !== 'populer');
assert.equal(groupCats.length, 13, 'Must have 13 official TXT category groups');

let partitionSum = 0;
const seenInGroups = new Map<string, string>();
for (const cat of groupCats) {
  const matches = ALL_TURKISH_STATIONS.filter((s) => matchesCategory(s, cat.id));
  assert.ok(matches.length > 0, `Category ${cat.id} (${cat.name}) returned 0 stations`);
  partitionSum += matches.length;
  for (const s of matches) {
    const id = s.stationuuid || s.name;
    assert.ok(
      !seenInGroups.has(id),
      `Cross-category leakage! Station "${s.name}" matched both ${seenInGroups.get(id)} and ${cat.id}`
    );
    seenInGroups.set(id, cat.id);
  }
}
assert.equal(
  partitionSum,
  ALL_TURKISH_STATIONS.length,
  `Partition sum (${partitionSum}) must equal total stations (${ALL_TURKISH_STATIONS.length})`
);
console.log(`✓ All 13 category groups cleanly partition all ${ALL_TURKISH_STATIONS.length} stations with ZERO leakage`);

// 4. Verify all 17 multi-group subcategories return > 0 stations and map back to parent group
for (const sub of SUBCATEGORIES) {
  const matches = ALL_TURKISH_STATIONS.filter((s) => matchesCategory(s, sub.id));
  assert.ok(matches.length > 0, `Subcategory ${sub.id} (${sub.name}) returned 0 stations`);
  assert.equal(getParentGroupId(sub.id), sub.parentGroupId);
}
assert.equal(getSubcategoriesForGroup('halk_yoresel').length, 3);
assert.equal(getSubcategoriesForGroup('yerel_genel').length, 3);
console.log(`✓ All ${SUBCATEGORIES.length} subcategories verified with non-zero counts`);

// 5. Verify foreign Radio Browser station fallback matching still works
const foreignRock: RadioStation = {
  stationuuid: 'de-rock-1',
  name: 'Rock Antenne',
  url: 'https://stream.rockantenne.de/rockantenne/stream/mp3',
  url_resolved: 'https://stream.rockantenne.de/rockantenne/stream/mp3',
  homepage: '',
  favicon: '',
  tags: 'rock,alternative,classic rock',
  country: 'Germany',
  countrycode: 'DE',
  votes: 500,
  codec: 'MP3',
  bitrate: 128
};
const foreignNews: RadioStation = {
  stationuuid: 'us-news-1',
  name: 'NPR News',
  url: 'https://npr-ice.streamguys1.com/live.mp3',
  url_resolved: 'https://npr-ice.streamguys1.com/live.mp3',
  homepage: '',
  favicon: '',
  tags: 'news,talk,public radio',
  country: 'USA',
  countrycode: 'US',
  votes: 1000,
  codec: 'MP3',
  bitrate: 128
};
assert.equal(matchesCategory(foreignRock, 'rock_rap'), true);
assert.equal(matchesCategory(foreignRock, 'haber_spor'), false);
assert.equal(matchesCategory(foreignNews, 'haber_spor'), true);
assert.equal(matchesCategory(foreignNews, 'arabesk'), false);
console.log('✓ Foreign Radio Browser tag-based category matching verified');

console.log('ALL TESTS PASSED!');
