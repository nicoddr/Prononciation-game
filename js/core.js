/* French Prononciation — shared core (sound, voice, storage, mute buttons) */
(function () {
  'use strict';

  const SOUND_KEY = 'fp.sound.v1';
  const HERO_KEY = 'fp.hero.v1';

  function read(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      return value == null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      /* storage can be unavailable in private mode */
    }
  }

  let soundOn = read(SOUND_KEY, '1') !== '0';
  let ctx = null;
  let master = null;

  /* ---------------------------------------------------------------------
     Chiptune SFX
     --------------------------------------------------------------------- */

  function unlockAudio() {
    if (!ctx) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      try {
        ctx = new AudioCtor();
        master = ctx.createGain();
        master.gain.value = 0.55;
        master.connect(ctx.destination);
      } catch (error) {
        return null;
      }
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(function () {});
    }
    return ctx;
  }

  function tone(options) {
    if (!soundOn) return;
    const ac = unlockAudio();
    if (!ac || !master) return;

    const freq = options.freq || 440;
    const dur = options.dur || 0.12;
    const type = options.type || 'square';
    const vol = options.vol == null ? 0.12 : options.vol;
    const delay = options.delay || 0;
    const t0 = ac.currentTime + delay;

    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (options.to) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(25, options.to), t0 + dur);
    }
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  const SFX = {
    click: function () {
      tone({ freq: 660, dur: 0.05, vol: 0.11 });
    },
    nav: function () {
      tone({ freq: 520, to: 920, dur: 0.12, vol: 0.1 });
    },
    correct: function () {
      [523, 659, 784, 1047].forEach(function (freq, index) {
        tone({ freq: freq, dur: 0.16, vol: 0.11, delay: index * 0.08 });
      });
    },
    wrong: function () {
      tone({ freq: 180, to: 90, dur: 0.28, type: 'sawtooth', vol: 0.13 });
      tone({ freq: 120, to: 70, dur: 0.3, type: 'square', vol: 0.07, delay: 0.1 });
    },
    hurt: function () {
      tone({ freq: 95, to: 45, dur: 0.22, type: 'sawtooth', vol: 0.15 });
    },
    down: function () {
      tone({ freq: 320, to: 70, dur: 0.3, type: 'triangle', vol: 0.13 });
      tone({ freq: 180, to: 60, dur: 0.24, type: 'square', vol: 0.07, delay: 0.05 });
    },
    level: function () {
      [392, 523, 659, 784].forEach(function (freq, index) {
        tone({ freq: freq, dur: 0.14, vol: 0.1, delay: index * 0.09 });
      });
    },
    victory: function () {
      [523, 659, 784, 1047, 1319].forEach(function (freq, index) {
        tone({ freq: freq, dur: 0.22, vol: 0.11, delay: index * 0.12 });
      });
    },
    tick: function () {
      tone({ freq: 880, dur: 0.03, vol: 0.06 });
    }
  };

  /* ---------------------------------------------------------------------
     Background music
     --------------------------------------------------------------------- */

  const MUSIC_ENABLED_KEY = 'fp.music.enabled.v1';
  const MUSIC_LEVEL_KEY = 'fp.music.level.v1';

  const savedMusicEnabled = read(MUSIC_ENABLED_KEY, '1') !== '0';
  const savedMusicLevel = Number(read(MUSIC_LEVEL_KEY, '100'));

  let musicEnabled = savedMusicEnabled;
  let musicLevel = Number.isFinite(savedMusicLevel)
    ? Math.max(0, Math.min(1, savedMusicLevel / 100))
    : 1;
  let musicEl = null;
  let musicSrc = '';
  let musicWanted = false;
  let musicBaseVolume = 0.26;

  function musicTargetVolume() {
    return musicBaseVolume * musicLevel;
  }

  function applyMusicVolume() {
    if (musicEl) musicEl.volume = musicTargetVolume();
  }

  function ensureMusic() {
    if (musicEl) return musicEl;
    musicEl = new Audio();
    musicEl.loop = true;
    musicEl.preload = 'auto';
    musicEl.volume = musicTargetVolume();
    return musicEl;
  }

  function playMusic(src, options) {
    if (!src) return;
    const settings = Object.assign({ volume: 0.26 }, options || {});
    musicWanted = true;
    musicBaseVolume = settings.volume;
    const el = ensureMusic();
    applyMusicVolume();
    if (musicSrc !== src) {
      musicSrc = src;
      el.src = src;
    }
    if (!soundOn || !musicEnabled) return;
    const attempt = el.play();
    if (attempt && attempt.catch) attempt.catch(function () {});
  }

  function stopMusic() {
    musicWanted = false;
    if (!musicEl) return;
    try {
      musicEl.pause();
      musicEl.currentTime = 0;
    } catch (error) {
      /* ignore */
    }
  }

  function resumeMusic() {
    if (!musicWanted || !musicEl || !soundOn || !musicEnabled) return;
    applyMusicVolume();
    const attempt = musicEl.play();
    if (attempt && attempt.catch) attempt.catch(function () {});
  }

  function setMusicEnabled(on) {
    musicEnabled = Boolean(on);
    write(MUSIC_ENABLED_KEY, musicEnabled ? '1' : '0');
    if (!musicEnabled) {
      if (musicEl) musicEl.pause();
    } else {
      resumeMusic();
      if (soundOn) SFX.tick();
    }
    syncSettingsUI();
  }

  function setMusicLevel(level) {
    const value = Number(level);
    musicLevel = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
    write(MUSIC_LEVEL_KEY, String(Math.round(musicLevel * 100)));
    applyMusicVolume();
    if (musicEnabled && soundOn && musicWanted) resumeMusic();
    syncSettingsUI();
  }

  /* ---------------------------------------------------------------------
     French voice playback
     --------------------------------------------------------------------- */

  let voices = [];

  function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    try {
      voices = window.speechSynthesis.getVoices() || [];
    } catch (error) {
      voices = [];
    }
  }

  function frenchVoice() {
    if (!voices.length) loadVoices();
    return (
      voices.find(function (voice) { return /^fr[-_]fr/i.test(voice.lang); }) ||
      voices.find(function (voice) { return /^fr/i.test(voice.lang); }) ||
      null
    );
  }

  function speak(text, options) {
    if (!text || !('speechSynthesis' in window)) return false;
    const settings = Object.assign({ rate: 0.82, pitch: 1, interrupt: true }, options || {});
    try {
      if (settings.interrupt) window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = settings.rate;
      utterance.pitch = settings.pitch;
      utterance.volume = soundOn ? 1 : 0;
      const voice = frenchVoice();
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      return false;
    }
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  /* ---------------------------------------------------------------------
     Mute buttons
     --------------------------------------------------------------------- */

  const ICON_ON =
    '<svg viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">' +
    '<path d="M1 6h3l3-3h1v10H7l-3-3H1z"/>' +
    '<path d="M10 5h1v6h-1z"/>' +
    '<path d="M12 3h1v10h-1z"/>' +
    '<path d="M14 5h1v6h-1z"/>' +
    '</svg>';

  const ICON_OFF =
    '<svg viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">' +
    '<path d="M1 6h3l3-3h1v10H7l-3-3H1z"/>' +
    '<rect x="10" y="4" width="1" height="1"/><rect x="13" y="4" width="1" height="1"/>' +
    '<rect x="11" y="5" width="1" height="1"/><rect x="12" y="5" width="1" height="1"/>' +
    '<rect x="11" y="6" width="1" height="1"/><rect x="12" y="6" width="1" height="1"/>' +
    '<rect x="10" y="7" width="1" height="1"/><rect x="13" y="7" width="1" height="1"/>' +
    '</svg>';

  const SETTINGS_ICON =
    '<svg viewBox="0 0 16 16" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">' +
    '<rect x="1" y="3" width="3" height="2"/>' +
    '<rect x="7" y="3" width="8" height="2"/>' +
    '<rect x="4" y="1" width="3" height="6"/>' +
    '<rect x="1" y="7" width="9" height="2"/>' +
    '<rect x="13" y="7" width="2" height="2"/>' +
    '<rect x="10" y="5" width="3" height="6"/>' +
    '<rect x="1" y="11" width="6" height="2"/>' +
    '<rect x="10" y="11" width="5" height="2"/>' +
    '<rect x="7" y="9" width="3" height="6"/>' +
    '</svg>';

  function updateAudioButtons() {
    document.querySelectorAll('[data-mute]').forEach(function (button) {
      button.innerHTML = soundOn ? ICON_ON : ICON_OFF;
      button.classList.toggle('muted', !soundOn);
      button.setAttribute('aria-label', soundOn ? 'Mute sound' : 'Unmute sound');
      button.setAttribute('aria-pressed', String(!soundOn));
    });
    document.querySelectorAll('[data-settings]').forEach(function (button) {
      if (!button.querySelector('svg')) button.innerHTML = SETTINGS_ICON;
      button.setAttribute('aria-label', 'Audio settings');
    });
  }

  function setSound(on) {
    soundOn = Boolean(on);
    write(SOUND_KEY, soundOn ? '1' : '0');
    if (!soundOn && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        /* ignore */
      }
    }
    if (soundOn) {
      resumeMusic();
    } else if (musicEl) {
      musicEl.pause();
    }
    updateAudioButtons();
    if (soundOn) SFX.tick();
  }

  document.addEventListener('click', function (event) {
    const button = event.target.closest ? event.target.closest('[data-mute]') : null;
    if (!button) return;
    event.preventDefault();
    setSound(!soundOn);
  });

  document.addEventListener('pointerdown', unlockAudio, { once: true, passive: true });
  document.addEventListener('pointerdown', resumeMusic, { passive: true });
  document.addEventListener('keydown', resumeMusic);

  window.addEventListener('pageshow', updateAudioButtons);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAudioButtons);
  } else {
    updateAudioButtons();
  }

  /* ---------------------------------------------------------------------
     Audio settings panel
     --------------------------------------------------------------------- */

  let settingsEl = null;
  let settingsTrigger = null;

  function syncSettingsUI() {
    if (!settingsEl) return;
    const percent = Math.round(musicLevel * 100);
    const toggle = settingsEl.querySelector('[data-music-toggle]');
    const toggleText = settingsEl.querySelector('[data-music-toggle-text]');
    const slider = settingsEl.querySelector('[data-music-volume]');
    const value = settingsEl.querySelector('[data-music-value]');
    const sliderWrap = settingsEl.querySelector('.settings-slider-wrap');

    if (toggle) {
      toggle.classList.toggle('on', musicEnabled);
      toggle.setAttribute('aria-pressed', String(musicEnabled));
    }
    if (toggleText) toggleText.textContent = musicEnabled ? 'ON' : 'OFF';
    if (slider) {
      slider.value = String(percent);
      slider.style.setProperty('--val', percent + '%');
    }
    if (value) value.textContent = percent + '%';
    if (sliderWrap) sliderWrap.classList.toggle('is-off', !musicEnabled);
  }

  function buildSettings() {
    if (settingsEl) return settingsEl;
    const host = document.querySelector('.frame') || document.body;
    const el = document.createElement('div');
    el.className = 'settings-overlay';
    el.hidden = true;
    el.innerHTML =
      '<div class="settings-card" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">' +
        '<span class="settings-kicker">Audio</span>' +
        '<h2 class="settings-title" id="settingsTitle">Settings</h2>' +
        '<div class="settings-row">' +
          '<span class="settings-label">Music</span>' +
          '<button type="button" class="pixel-toggle" data-music-toggle aria-label="Music" aria-pressed="true">' +
            '<span class="toggle-dot" aria-hidden="true"></span>' +
            '<span data-music-toggle-text>ON</span>' +
          '</button>' +
        '</div>' +
        '<div class="settings-slider-wrap">' +
          '<input type="range" class="music-range" min="0" max="100" step="1" value="100" data-music-volume aria-label="Music volume">' +
          '<span class="settings-value" data-music-value>100%</span>' +
        '</div>' +
        '<p class="settings-note">Lower the music or switch it off. The speaker button mutes every sound.</p>' +
        '<button type="button" class="btn settings-close" data-settings-close>Close</button>' +
      '</div>';
    host.appendChild(el);
    settingsEl = el;

    el.querySelector('[data-music-toggle]').addEventListener('click', function () {
      setMusicEnabled(!musicEnabled);
    });
    const slider = el.querySelector('[data-music-volume]');
    slider.addEventListener('input', function () {
      setMusicLevel(Number(slider.value) / 100);
    });
    slider.addEventListener('change', function () {
      if (soundOn) SFX.tick();
    });
    el.querySelector('[data-settings-close]').addEventListener('click', closeSettings);
    el.addEventListener('click', function (event) {
      if (event.target === el) closeSettings();
    });
    syncSettingsUI();
    return el;
  }

  function openSettings(trigger) {
    const el = buildSettings();
    settingsTrigger = trigger || null;
    syncSettingsUI();
    el.hidden = false;
    window.dispatchEvent(new CustomEvent('fp-settings', { detail: { open: true } }));
    SFX.click();
    const close = el.querySelector('[data-settings-close]');
    if (close) {
      try {
        close.focus({ preventScroll: true });
      } catch (error) {
        close.focus();
      }
    }
  }

  function closeSettings() {
    if (!settingsEl || settingsEl.hidden) return;
    settingsEl.hidden = true;
    window.dispatchEvent(new CustomEvent('fp-settings', { detail: { open: false } }));
    SFX.click();
    if (settingsTrigger && document.contains(settingsTrigger)) {
      try {
        settingsTrigger.focus({ preventScroll: true });
      } catch (error) {
        settingsTrigger.focus();
      }
    }
    settingsTrigger = null;
  }

  document.addEventListener('click', function (event) {
    const button = event.target.closest ? event.target.closest('[data-settings]') : null;
    if (!button) return;
    event.preventDefault();
    openSettings(button);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && settingsEl && !settingsEl.hidden) {
      event.preventDefault();
      closeSettings();
    }
  });

  /* ---------------------------------------------------------------------
     Public API
     --------------------------------------------------------------------- */

  window.FP = {
    play: function (name) {
      const fn = SFX[name];
      if (typeof fn === 'function') fn();
    },
    sfx: SFX,
    speak: speak,
    playMusic: playMusic,
    stopMusic: stopMusic,
    isMusicEnabled: function () {
      return musicEnabled;
    },
    getMusicLevel: function () {
      return musicLevel;
    },
    setMusicEnabled: setMusicEnabled,
    setMusicLevel: setMusicLevel,
    openSettings: function () {
      openSettings(null);
    },
    musicState: function () {
      return musicEl
        ? {
            paused: musicEl.paused,
            currentTime: musicEl.currentTime,
            volume: musicEl.volume,
            src: musicEl.src
          }
        : null;
    },
    unlockAudio: unlockAudio,
    isSoundOn: function () {
      return soundOn;
    },
    setSound: setSound,
    toggleSound: function () {
      setSound(!soundOn);
    },
    getHero: function () {
      return read(HERO_KEY, 'b') === 'g' ? 'g' : 'b';
    },
    setHero: function (hero) {
      write(HERO_KEY, hero === 'g' ? 'g' : 'b');
    }
  };
})();
