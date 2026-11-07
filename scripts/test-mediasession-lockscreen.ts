/**
 * RadioCast — Kilit Ekranı ve Medya Kontrolleri Doğrulama Testi
 */
import { audioEngine } from '../src/services/audioEngine';
import { ALL_TURKISH_STATIONS } from '../src/data/fallbackStations';

console.log('===========================================================');
console.log('RadioCast — Kilit Ekranı & Medya Kontrolleri Teşhis Testi');
console.log('===========================================================');

let testPassed = 0;
let testFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    testPassed++;
  } else {
    console.error(`[FAIL] ${message}`);
    testFailed++;
  }
}

// 1. AudioEngine instance check
assert(typeof audioEngine === 'object' && audioEngine !== null, 'AudioEngine singleton tekil nesne olarak mevcut.');

// 2. Mock MediaSession to test action handlers and synchronous execution
const registeredHandlers: Record<string, Function> = {};
let mockPlaybackState = 'none';
let mockPositionStateCalls = 0;

const mockMediaSession = {
  get playbackState() {
    return mockPlaybackState;
  },
  set playbackState(val: string) {
    mockPlaybackState = val;
  },
  setActionHandler(action: string, handler: Function | null) {
    if (handler) {
      registeredHandlers[action] = handler;
    } else {
      delete registeredHandlers[action];
    }
  },
  setPositionState(state?: any) {
    mockPositionStateCalls++;
    if (state === null) {
      throw new TypeError("Failed to execute 'setPositionState' on 'MediaSession': The provided value is not of type 'MediaPositionState'.");
    }
  }
};

Object.defineProperty(globalThis, 'navigator', {
  value: {
    mediaSession: mockMediaSession
  },
  configurable: true,
  writable: true
});

// Re-init permanent handlers on the mock
(audioEngine as any).setupPermanentMediaSessionHandlers();

assert(typeof registeredHandlers['pause'] === 'function', "navigator.mediaSession.setActionHandler('pause') kalıcı olarak kayıtlı.");
assert(typeof registeredHandlers['play'] === 'function', "navigator.mediaSession.setActionHandler('play') kalıcı olarak kayıtlı.");
assert(typeof registeredHandlers['stop'] === 'function', "navigator.mediaSession.setActionHandler('stop') kalıcı olarak kayıtlı.");

// 3. Test Pause Action Handler synchronously
mockPlaybackState = 'playing';
let pauseExecuted = false;
(audioEngine as any).audio = {
  src: 'https://kralpopwmp.radyotvonline.net/',
  pause() {
    pauseExecuted = true;
  },
  play() {
    return Promise.resolve();
  }
};

// Simulate user pressing PAUSE on phone lock screen
try {
  registeredHandlers['pause']();
  assert(pauseExecuted, 'Kilit ekranı Pause butonuna basıldığında audio.pause() senkron olarak tetiklendi.');
  assert(mockPlaybackState === 'paused', 'Kilit ekranı Pause işlemi sonrasında playbackState derhal "paused" oldu.');
} catch (err: any) {
  assert(false, `Pause action handler hata fırlattı: ${err?.message}`);
}

// 4. Test Play Action Handler synchronously
let playExecuted = false;
(audioEngine as any).audio.play = () => {
  playExecuted = true;
  return Promise.resolve();
};

try {
  registeredHandlers['play']();
  assert(playExecuted, 'Kilit ekranı Play butonuna basıldığında audio.play() senkron olarak tetiklendi.');
  assert(mockPlaybackState === 'playing', 'Kilit ekranı Play işlemi sonrasında playbackState derhal "playing" oldu.');
} catch (err: any) {
  assert(false, `Play action handler hata fırlattı: ${err?.message}`);
}

// 5. Test clearPositionState on live radio (must NOT throw TypeError)
try {
  audioEngine.clearPositionState();
  assert(true, 'clearPositionState() live radio için hatasız çalıştı (TypeError fırlatmadı).');
} catch (err: any) {
  assert(false, `clearPositionState() TypeError fırlattı: ${err?.message}`);
}

// 6. Test Next / Previous track handling without route changes
let nextCalled = false;
let prevCalled = false;

audioEngine.setCallbacks({
  onNext: () => { nextCalled = true; },
  onPrevious: () => { prevCalled = true; }
});

assert(typeof registeredHandlers['nexttrack'] === 'function', "onNext mevcut olduğunda 'nexttrack' butonu aktifleşti.");
assert(typeof registeredHandlers['previoustrack'] === 'function', "onPrevious mevcut olduğunda 'previoustrack' butonu aktifleşti.");

registeredHandlers['nexttrack']();
assert(nextCalled, 'Kilit ekranı Next butonu onNext callbackini doğrudan tetikledi.');

registeredHandlers['previoustrack']();
assert(prevCalled, 'Kilit ekranı Previous butonu onPrevious callbackini doğrudan tetikledi.');

console.log('===========================================================');
console.log(`SONUÇ: ${testPassed}/${testPassed + testFailed} test başarıyla tamamlandı.`);
console.log('===========================================================');

if (testFailed > 0) {
  process.exit(1);
}
