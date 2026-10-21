/* ==========================================================================
   FRENCH PRONONCIATION — game loop
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Sprite sheets (alpha bounding boxes measured from the PNG files)
     bx/by/bw/bh are fractions of the 512x512 transparent canvas.
     h is the visible height of the character, in cqw.
     --------------------------------------------------------------------- */

  const SPRITES = {
    crs: {
      name: 'CRS',
      dir: 'Images/Characters/CRS',
      poses: {
        stand: { file: 'Stand.png', bx: 0.2129, by: 0.0684, bw: 0.5586, bh: 0.8984 },
        atk: { file: 'Atk.png', bx: 0.1328, by: 0.0684, bw: 0.7598, bh: 0.8984 },
        down: { file: 'Down.png', bx: 0.0527, by: 0.3672, bw: 0.8887, bh: 0.4902 }
      },
      h: { stand: 17, atk: 17, down: 7 },
      slot: { stand: 18, atk: 18, down: 16 }
    },
    crs2: {
      name: 'CRS 2',
      dir: 'Images/Characters/CRS 2',
      boss: true,
      poses: {
        stand: { file: 'Stand.png', bx: 0.3105, by: 0.0664, bw: 0.375, bh: 0.8945 },
        atk: { file: 'Atk.png', bx: 0.1816, by: 0.043, bw: 0.6289, bh: 0.9199 },
        down: { file: 'Down.png', bx: 0.0508, by: 0.3848, bw: 0.8672, bh: 0.4141 }
      },
      h: { stand: 19, atk: 19, down: 7.4 },
      slot: { stand: 20, atk: 20, down: 17 }
    },
    crs3: {
      name: 'CRS 3',
      dir: 'Images/Characters/CRS 3',
      boss: true,
      poses: {
        stand: { file: 'Stand.png', bx: 0.3105, by: 0.0488, bw: 0.416, bh: 0.9336 },
        atk: { file: 'Atk.png', bx: 0.1514, by: 0.0811, bw: 0.8018, bh: 0.8828 },
        down: { file: 'Down.png', bx: 0.043, by: 0.4277, bw: 0.9355, bh: 0.4023 }
      },
      h: { stand: 20, atk: 20, down: 7.6 },
      slot: { stand: 21, atk: 21, down: 18 }
    },
    macron: {
      name: 'MACRON',
      dir: 'Images/Characters/Macron',
      boss: true,
      poses: {
        stand: { file: 'stand.png', bx: 0.2734, by: 0.0332, bw: 0.4238, bh: 0.9531 },
        atk: { file: 'Atk.png', bx: 0.0586, by: 0.0684, bw: 0.9141, bh: 0.8984 },
        down: { file: 'Down.png', bx: 0.0781, by: 0.3984, bw: 0.8945, bh: 0.2539 }
      },
      h: { stand: 20, atk: 20, down: 6.4 },
      slot: { stand: 21, atk: 21, down: 18 }
    },
    mbappe: {
      name: 'MBAPPÉ',
      dir: 'Images/Characters/Mbappe',
      boss: true,
      poses: {
        stand: { file: 'Stand.png', bx: 0.293, by: 0.0156, bw: 0.4531, bh: 0.9668 },
        atk: { file: 'Atk.png', bx: 0.0254, by: 0.0566, bw: 0.9258, bh: 0.9258 },
        down: { file: 'Down.png', bx: 0.0293, by: 0.4668, bw: 0.9551, bh: 0.3242 }
      },
      h: { stand: 22, atk: 22, down: 7.8 },
      slot: { stand: 24, atk: 24, down: 19 }
    },
    heroB: {
      name: 'FRENCH B 1',
      dir: 'Images/Characters/French B 1',
      poses: {
        stand: { file: 'Stand.png', bx: 0.2773, by: 0.0684, bw: 0.459, bh: 0.873 },
        atk: { file: 'Atk.png', bx: 0.1582, by: 0.0684, bw: 0.7891, bh: 0.873 },
        down: { file: 'Down.png', bx: 0.0371, by: 0.4082, bw: 0.9355, bh: 0.3691 }
      },
      h: { stand: 18, atk: 18, down: 7 },
      slot: { stand: 24, atk: 24, down: 19 }
    },
    heroG: {
      name: 'FRENCH G 1',
      dir: 'Images/Characters/French G 1',
      poses: {
        stand: { file: 'Stand.png', bx: 0.334, by: 0.0391, bw: 0.3613, bh: 0.9277 },
        atk: { file: 'Atk.png', bx: 0.0625, by: 0.0684, bw: 0.9043, bh: 0.8828 },
        down: { file: 'Down.png', bx: 0.0586, by: 0.3984, bw: 0.9141, bh: 0.2793 }
      },
      h: { stand: 18, atk: 18, down: 6.6 },
      slot: { stand: 24, atk: 24, down: 19 }
    }
  };

  const CRS = 'crs';
  const CRS2 = 'crs2';
  const CRS3 = 'crs3';
  const MACRON = 'macron';
  const MBAPPE = 'mbappe';

  const LEVELS = [
    {
      n: 1,
      name: 'RUE DE PARIS',
      sub: 'THE STREETS',
      intro: '3 CRS BLOCK THE STREET',
      cam: 0,
      phases: [
        { word: { fr: 'Lutte', en: 'Struggle / Fight' }, enemies: [CRS, CRS, CRS], down: 0 },
        { word: { fr: 'Dégât', en: 'Damage' }, enemies: [CRS, CRS], down: 1 },
        { word: { fr: 'Arrêt', en: 'Arrest / Stoppage' }, enemies: [CRS], down: 2 }
      ]
    },
    {
      n: 2,
      name: 'PONT ALEXANDRE III',
      sub: 'THE RIOTS',
      intro: 'THE RIOTS SPREAD',
      cam: 0.24,
      phases: [
        { word: { fr: 'Les émeutes', en: 'The riots' }, enemies: [CRS, CRS, CRS2], down: 0 },
        { word: { fr: 'Des affrontements', en: 'Clashes' }, enemies: [CRS, CRS2], down: 1 },
        { word: { fr: 'Aux armes !', en: 'To arms!' }, enemies: [CRS2], down: 2 }
      ]
    },
    {
      n: 3,
      name: 'LA SEINE',
      sub: 'THE STRIKE',
      intro: 'THE STRIKE BURNS',
      cam: 0.48,
      phases: [
        { word: { fr: 'Grève', en: 'Strike' }, enemies: [CRS, CRS, CRS3], down: 0 },
        { word: { fr: 'Réforme', en: 'Reform' }, enemies: [CRS, CRS3], down: 1 },
        { word: { fr: 'Révolution', en: 'Revolution' }, enemies: [CRS3], down: 2 }
      ]
    },
    {
      n: 4,
      name: 'LA TOUR EIFFEL',
      sub: 'THE PROTEST',
      intro: 'THE PRESIDENT SPEAKS',
      cam: 0.72,
      phases: [
        { word: { fr: 'Manifestation', en: 'Protest / Demonstration' }, enemies: [CRS, CRS, MACRON], down: 0 },
        { word: { fr: 'Violence', en: 'Violence' }, enemies: [CRS, MACRON], down: 1 },
        { word: { fr: 'Tension', en: 'Tension' }, enemies: [MACRON], down: 2 }
      ]
    },
    {
      n: 5,
      name: 'STADE DE FRANCE',
      sub: 'THE FINAL',
      intro: 'MBAPPÉ WAITS AT THE STADIUM',
      cam: 1,
      phases: [
        { word: { fr: 'Brouillard', en: 'Smoke / Fog' }, enemies: [CRS, CRS, MBAPPE], down: 0 },
        { word: { fr: 'Garde à vue', en: 'Police custody' }, enemies: [CRS, MBAPPE], down: 1 },
        { word: { fr: 'Brûler', en: 'To burn' }, enemies: [MBAPPE], down: 2 }
      ]
    }
  ];

  const HEART_PATH =
    'M2 0h2v1H2zM8 0h2v1H8z' +
    'M1 1h4v1H1zM7 1h4v1H7z' +
    'M0 2h12v3H0z' +
    'M1 5h10v1H1z' +
    'M2 6h8v1H2z' +
    'M3 7h6v1H3z' +
    'M4 8h4v1H4z' +
    'M5 9h2v1H5z';

  /* ---------------------------------------------------------------------
     DOM
     --------------------------------------------------------------------- */

  const $ = function (id) {
    return document.getElementById(id);
  };

  const stage = $('stage');
  const sceneBg = $('sceneBg');
  const enemyRow = $('enemyRow');
  const playerSlot = $('playerSlot');
  const playerImg = $('playerImg');
  const playerSprite = $('playerSprite');
  const heartsEl = $('hearts');
  const levelNum = $('levelNum');
  const levelTag = $('levelTag');
  const pipsEl = $('pips');
  const speech = $('speech');
  const speechTag = $('speechTag');
  const speechWord = $('speechWord');
  const speechEn = $('speechEn');
  const statusEl = $('status');
  const captionEl = $('caption');
  const micWrap = $('micWrap');
  const micBtn = $('micBtn');
  const micHint = $('micHint');
  const skipBtn = $('skipBtn');
  const replayBtn = $('replayBtn');
  const typeForm = $('typeForm');
  const typeInput = $('typeInput');
  const fx = $('fx');
  const banner = $('banner');
  const hurtFlash = $('hurtFlash');
  const overlay = $('overlay');

  /* ---------------------------------------------------------------------
     State
     --------------------------------------------------------------------- */

  const params = new URLSearchParams(window.location.search);
  const heroParam = params.get('hero');
  const heroKey = (heroParam === 'g' || heroParam === 'b')
    ? (heroParam === 'g' ? 'heroG' : 'heroB')
    : (FP.getHero() === 'g' ? 'heroG' : 'heroB');

  const state = {
    hp: 10,
    maxHp: 10,
    levelIndex: 0,
    phaseIndex: 0,
    busy: false,
    active: false,
    over: false,
    perfects: 0,
    misses: 0,
    skips: 0,
    attempts: 0
  };

  let flowId = 0;
  let fallbackActive = false;

  /* speech recognition */
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let holding = false;
  let resolved = true;
  let heardFinals = [];
  let heardInterim = '';
  let listenToken = 0;
  let restartCount = 0;
  let lastError = null;

  /* microphone analyser (sparkles) */
  let micStream = null;
  let analyser = null;
  let micData = null;
  let micRequested = false;

  /* ---------------------------------------------------------------------
     Small helpers
     --------------------------------------------------------------------- */

  function currentPhase() {
    const level = LEVELS[state.levelIndex];
    return level ? level.phases[state.phaseIndex] : null;
  }

  function nextFlow() {
    flowId += 1;
    return flowId;
  }

  function after(ms, fn) {
    const id = flowId;
    window.setTimeout(function () {
      if (id === flowId) fn();
    }, ms);
  }

  function vibrate(pattern) {
    if (!navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch (error) {
      /* ignore */
    }
  }

  function setStatus(text, tone) {
    statusEl.textContent = text;
    statusEl.className = 'status' + (tone ? ' ' + tone : '');
  }

  function setCaption(text) {
    captionEl.textContent = text;
    captionEl.className = 'caption';
  }

  function stageShake() {
    stage.classList.remove('shake');
    void stage.offsetWidth;
    stage.classList.add('shake');
    window.setTimeout(function () {
      stage.classList.remove('shake');
    }, 420);
  }

  function hurtFlashOn() {
    hurtFlash.classList.remove('on');
    void hurtFlash.offsetWidth;
    hurtFlash.classList.add('on');
    window.setTimeout(function () {
      hurtFlash.classList.remove('on');
    }, 460);
  }

  function addFloater(text, tone, small) {
    const floater = document.createElement('div');
    floater.className = 'floater' + (tone ? ' ' + tone : '') + (small ? ' half' : '');
    floater.textContent = text;
    floater.style.left = (50 + (Math.random() * 8 - 4)) + '%';
    fx.appendChild(floater);
    window.setTimeout(function () {
      floater.remove();
    }, 1200);
  }

  function slashFx() {
    const stageBox = stage.getBoundingClientRect();
    const target = enemyRow.querySelector('.actor-slot.speaking') ||
      enemyRow.querySelector('.actor-slot:not(.downed)') ||
      enemyRow.lastElementChild;
    if (!target) return;
    const box = target.getBoundingClientRect();
    const slash = document.createElement('div');
    slash.className = 'slash';
    slash.style.left = (box.left - stageBox.left + box.width * 0.25) + 'px';
    slash.style.top = (box.top - stageBox.top + box.height * 0.42) + 'px';
    fx.appendChild(slash);
    window.setTimeout(function () {
      slash.remove();
    }, 400);
  }

  /* ---------------------------------------------------------------------
     Hearts
     --------------------------------------------------------------------- */

  function buildHearts() {
    heartsEl.innerHTML = '';
    for (let i = 0; i < 5; i += 1) {
      const heart = document.createElement('div');
      heart.className = 'heart';
      heart.innerHTML =
        '<svg class="heart-bg" viewBox="0 0 12 10" aria-hidden="true"><path d="' + HEART_PATH + '"/></svg>' +
        '<span class="heart-fill"><svg viewBox="0 0 12 10" aria-hidden="true"><path d="' + HEART_PATH + '"/></svg></span>';
      heartsEl.appendChild(heart);
    }
    renderHearts();
  }

  function renderHearts() {
    Array.from(heartsEl.children).forEach(function (heart, index) {
      const fill = Math.max(0, Math.min(2, state.hp - index * 2));
      heart.querySelector('.heart-fill').style.width = (fill * 50) + '%';
    });
    const hearts = state.hp / 2;
    heartsEl.setAttribute('aria-label', 'Health: ' + hearts + ' of 5 hearts');
  }

  function damage(amount, label) {
    if (state.hp <= 0) return;
    state.hp = Math.max(0, state.hp - amount);
    renderHearts();
    const lostIndex = Math.min(4, Math.floor(state.hp / 2));
    const heart = heartsEl.children[lostIndex];
    if (heart) {
      heart.classList.remove('hit');
      void heart.offsetWidth;
      heart.classList.add('hit');
      window.setTimeout(function () {
        heart.classList.remove('hit');
      }, 420);
    }
    addFloater(label || '-\u00bd', 'bad', true);
  }

  /* ---------------------------------------------------------------------
     Actors
     --------------------------------------------------------------------- */

  function setPose(slot, pose) {
    const key = slot.dataset.char;
    const character = SPRITES[key];
    if (!character) return;
    const data = character.poses[pose] || character.poses.stand;
    const sprite = slot.querySelector('.sprite');
    const image = slot.querySelector('img');
    if (!sprite || !image) return;

    sprite.style.setProperty('--h', character.h[pose] + 'cqw');
    sprite.style.setProperty('--bw', data.bw);
    sprite.style.setProperty('--bh', data.bh);
    sprite.style.setProperty('--bx', data.bx);
    sprite.style.setProperty('--by', data.by);
    slot.style.setProperty('--slot', character.slot[pose] + 'cqw');
    slot.dataset.pose = pose;
    slot.classList.toggle('is-idle', pose === 'stand');
    image.src = character.dir + '/' + data.file;
  }

  function createActor(key, pose, role) {
    const character = SPRITES[key];
    const slot = document.createElement('div');
    slot.className = 'actor-slot ' + role;
    slot.dataset.char = key;
    if (pose === 'down') slot.classList.add('downed');
    slot.innerHTML =
      '<div class="actor">' +
        '<div class="sprite"><img draggable="false"></div>' +
      '</div>';
    const image = slot.querySelector('img');
    image.alt = character.name;
    setPose(slot, pose);
    return slot;
  }

  function getStandingEnemies() {
    return Array.from(enemyRow.querySelectorAll('.actor-slot')).filter(function (slot) {
      return slot.dataset.pose === 'stand';
    });
  }

  function renderEnemies(phase) {
    enemyRow.innerHTML = '';
    for (let i = 0; i < phase.down; i += 1) {
      enemyRow.appendChild(createActor(CRS, 'down', 'enemy'));
    }
    phase.enemies.forEach(function (key, index) {
      const slot = createActor(key, 'stand', 'enemy');
      if (index === phase.enemies.length - 1) slot.classList.add('speaking');
      enemyRow.appendChild(slot);
    });
    enemyRow.style.opacity = '';
  }

  function playerFile(pose) {
    const character = SPRITES[heroKey];
    return character.dir + '/' + character.poses[pose].file;
  }

  function initPlayer() {
    playerSlot.dataset.char = heroKey;
    playerSprite.style.setProperty('--h', SPRITES[heroKey].h.stand + 'cqw');
    playerImg.alt = SPRITES[heroKey].name;
    playerImg.src = playerFile('stand');
    setPose(playerSlot, 'stand');
  }

  function playerAttack() {
    playerSlot.classList.remove('hurt');
    setPose(playerSlot, 'atk');
    playerSlot.classList.add('attacking');
    window.setTimeout(function () {
      if (playerSlot.dataset.pose === 'atk') {
        setPose(playerSlot, 'stand');
        playerSlot.classList.remove('attacking');
      }
    }, 520);
  }

  function playerHurt() {
    playerSlot.classList.remove('is-idle', 'attacking');
    playerSlot.classList.add('hurt');
    window.setTimeout(function () {
      playerSlot.classList.remove('hurt');
      if (playerSlot.dataset.pose === 'stand') playerSlot.classList.add('is-idle');
    }, 520);
  }

  function enemyAttack() {
    const standing = getStandingEnemies();
    const speaker = standing[standing.length - 1];
    if (!speaker || speaker.classList.contains('downed')) return;
    setPose(speaker, 'atk');
    speaker.classList.add('attacking');
    window.setTimeout(function () {
      if (speaker.dataset.pose === 'atk' && !speaker.classList.contains('downed')) {
        setPose(speaker, 'stand');
        speaker.classList.remove('attacking');
      }
    }, 620);
  }

  function knockDownOne() {
    const standing = getStandingEnemies();
    if (!standing.length) return;
    const minions = standing.filter(function (slot) {
      return !SPRITES[slot.dataset.char].boss;
    });
    const target = minions.length ? minions[0] : standing[standing.length - 1];

    target.classList.remove('speaking', 'attacking', 'is-idle');
    target.classList.add('downed');
    setPose(target, 'down');
    target.animate(
      [{ filter: 'brightness(2.4)' }, { filter: 'brightness(1)' }],
      { duration: 260, easing: 'steps(3, end)' }
    );

    const rest = getStandingEnemies();
    rest.forEach(function (slot) {
      slot.classList.remove('speaking');
    });
    if (rest.length) rest[rest.length - 1].classList.add('speaking');

    const box = target.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    const slash = document.createElement('div');
    slash.className = 'slash';
    slash.style.left = (box.left - stageBox.left + box.width * 0.2) + 'px';
    slash.style.top = (box.top - stageBox.top + box.height * 0.5) + 'px';
    fx.appendChild(slash);
    window.setTimeout(function () {
      slash.remove();
    }, 380);
  }

  /* ---------------------------------------------------------------------
     Background camera
     --------------------------------------------------------------------- */

  function setCamera(position, animate) {
    const x = (position * 100).toFixed(2) + '%';
    if (!animate) {
      sceneBg.style.transition = 'none';
      sceneBg.style.backgroundPositionX = x;
      void sceneBg.offsetWidth;
      sceneBg.style.transition = '';
    } else {
      sceneBg.style.backgroundPositionX = x;
    }
  }

  function preload(url) {
    if (!url || preload.seen[url]) return;
    preload.seen[url] = true;
    const image = new Image();
    image.src = url;
  }
  preload.seen = {};

  function preloadLevel(level) {
    const keys = [heroKey, CRS];
    level.phases.forEach(function (phase) {
      phase.enemies.forEach(function (key) {
        if (keys.indexOf(key) === -1) keys.push(key);
      });
    });
    keys.forEach(function (key) {
      const character = SPRITES[key];
      ['stand', 'atk', 'down'].forEach(function (pose) {
        preload(character.dir + '/' + character.poses[pose].file);
      });
    });
  }

  /* ---------------------------------------------------------------------
     Banner / overlay / pips
     --------------------------------------------------------------------- */

  function showBanner(kicker, title, sub) {
    banner.innerHTML = '<b></b><span></span>';
    banner.querySelector('b').textContent = kicker;
    banner.querySelector('span').textContent = title;
    if (sub) {
      const small = document.createElement('small');
      small.textContent = sub;
      banner.appendChild(small);
    }
    banner.classList.add('show');
  }

  function hideBanner() {
    banner.classList.remove('show');
  }

  function renderPips() {
    const level = LEVELS[state.levelIndex];
    pipsEl.innerHTML = '';
    if (!level) return;
    level.phases.forEach(function (unused, index) {
      const pip = document.createElement('i');
      pip.className = 'pip' +
        (index < state.phaseIndex ? ' on' : '') +
        (index === state.phaseIndex ? ' current' : '');
      pipsEl.appendChild(pip);
    });
  }

  function hideOverlay() {
    overlay.hidden = true;
    overlay.innerHTML = '';
  }

  function showOverlay(options) {
    overlay.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'overlay-card';

    const kicker = document.createElement('span');
    kicker.className = 'overlay-kicker';
    kicker.textContent = options.kicker;
    card.appendChild(kicker);

    const title = document.createElement('h2');
    title.className = 'overlay-title' + (options.bad ? ' bad' : '');
    title.textContent = options.title;
    card.appendChild(title);

    if (options.sub) {
      const sub = document.createElement('p');
      sub.className = 'overlay-sub';
      sub.textContent = options.sub;
      card.appendChild(sub);
    }

    if (options.stats && options.stats.length) {
      const stats = document.createElement('div');
      stats.className = 'overlay-stats';
      options.stats.forEach(function (stat) {
        const block = document.createElement('div');
        block.className = 'overlay-stat';
        const value = document.createElement('b');
        value.textContent = String(stat.value);
        const label = document.createElement('span');
        label.textContent = stat.label;
        block.appendChild(value);
        block.appendChild(label);
        stats.appendChild(block);
      });
      card.appendChild(stats);
    }

    const actions = document.createElement('div');
    actions.className = 'overlay-actions';
    options.actions.forEach(function (action) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn' + (action.primary ? '' : ' secondary');
      button.textContent = action.label;
      button.addEventListener('click', function () {
        FP.play('click');
        action.onClick();
      });
      actions.appendChild(button);
    });
    card.appendChild(actions);

    overlay.appendChild(card);
    overlay.hidden = false;
  }

  /* ---------------------------------------------------------------------
     Speech bubble
     --------------------------------------------------------------------- */

  function updateSpeech(phase) {
    const speaker = phase.enemies[phase.enemies.length - 1];
    speechTag.textContent = SPRITES[speaker].name;
    speechWord.textContent = phase.word.fr;
    speechEn.textContent = phase.word.en;
    speech.classList.remove('show', 'hidden');
    void speech.offsetWidth;
    speech.classList.add('show');
  }

  function hideSpeech() {
    speech.classList.remove('show');
    speech.classList.add('hidden');
  }

  /* ---------------------------------------------------------------------
     Level flow
     --------------------------------------------------------------------- */

  function autoSpeak() {
    const phase = currentPhase();
    if (phase && FP.isSoundOn()) {
      FP.speak(phase.word.fr, { rate: 0.78 });
    }
  }

  function setReady(on) {
    state.active = Boolean(on);
    micBtn.disabled = !on || fallbackActive;
    skipBtn.disabled = !on;
    if (!on) {
      holding = false;
      micWrap.classList.remove('listening', 'hearing');
      micWrap.style.setProperty('--lvl', '0');
      micBtn.setAttribute('aria-pressed', 'false');
    }
    micHint.textContent = on ? 'HOLD' : 'WAIT';
  }

  function startGame() {
    state.hp = state.maxHp;
    state.perfects = 0;
    state.misses = 0;
    state.skips = 0;
    state.attempts = 0;
    state.over = false;
    renderHearts();
    initPlayer();
    startLevel(0, true);
  }

  function startLevel(index, instant) {
    nextFlow();
    state.levelIndex = index;
    state.phaseIndex = 0;
    state.busy = false;
    state.over = false;

    const level = LEVELS[index];
    const phase = level.phases[0];

    setReady(false);
    hideOverlay();
    hideSpeech();
    setPose(playerSlot, 'stand');
    playerSlot.classList.remove('downed', 'hurt', 'attacking', 'walking');
    levelNum.textContent = String(level.n);
    levelTag.textContent = 'LVL ' + level.n + ' \u00b7 ' + level.name;
    renderPips();
    setCamera(level.cam, false);
    preloadLevel(level);
    FP.playMusic(index < 3 ? 'Music/1-3.mp3' : 'Music/4-5.mp3', { volume: 0.26 });
    renderEnemies(phase);
    updateSpeech(phase);
    setStatus('READY', '');
    setCaption('Hold the mic and pronounce the word');
    showBanner('LEVEL ' + level.n, level.name, level.sub + ' \u00b7 ' + level.intro);
    FP.play('nav');

    after(1900, function () {
      hideBanner();
      setStatus('READY', '');
      setReady(true);
      autoSpeak();
    });
  }

  function startPhase(index) {
    nextFlow();
    state.phaseIndex = index;
    state.busy = false;

    const phase = LEVELS[state.levelIndex].phases[index];
    setReady(false);
    setPose(playerSlot, 'stand');
    playerSlot.classList.remove('downed', 'hurt', 'attacking', 'walking');
    renderPips();
    renderEnemies(phase);
    updateSpeech(phase);
    setStatus('READY', '');
    setCaption('Hold the mic and pronounce the word');
    FP.play('tick');

    after(450, function () {
      if (state.over) return;
      setReady(true);
      autoSpeak();
    });
  }

  function onSuccess(guess) {
    state.perfects += 1;
    state.attempts += 1;
    setStatus('PERFECT!', 'good');
    setCaption('\u201c' + guess + '\u201d \u2014 parfait!');
    FP.play('correct');
    vibrate(18);
    slashFx();
    playerAttack();

    after(330, function () {
      knockDownOne();
      FP.play('down');
      stageShake();
      addFloater('DOWN!');
    });

    after(1600, function () {
      if (state.phaseIndex < 2) {
        startPhase(state.phaseIndex + 1);
      } else {
        levelClear();
      }
    });
  }

  function onMiss(guess) {
    state.misses += 1;
    state.attempts += 1;
    setStatus('MISS!', 'bad');
    setCaption('\u201c' + (guess || '\u2026') + '\u201d \u2014 not quite. Listen, then retry.');
    FP.play('wrong');
    vibrate([30, 40, 30]);
    damage(1);
    stageShake();
    hurtFlashOn();
    playerHurt();
    enemyAttack();

    after(720, function () {
      const phase = currentPhase();
      if (phase && FP.isSoundOn()) FP.speak(phase.word.fr, { rate: 0.72 });
    });

    after(1250, function () {
      if (state.hp <= 0) {
        gameOver();
        return;
      }
      state.busy = false;
      setStatus('TRY AGAIN', 'bad');
      setCaption('Hold the mic and pronounce the word');
      setReady(true);
    });
  }

  function skipWord() {
    if (!state.active || state.busy || state.over) return;

    resolved = true;
    holding = false;
    setListening(false);
    stopRecognition();

    state.busy = true;
    state.skips += 1;
    setReady(false);
    setStatus('SKIPPED', 'bad');
    setCaption('Word skipped \u2014 one heart lost.');
    damage(2, '-1 HEART');
    stageShake();
    hurtFlashOn();
    playerAttack();
    FP.play('wrong');
    vibrate([30, 40, 30]);

    after(430, function () {
      knockDownOne();
      FP.play('down');
      addFloater('DOWN!');
    });

    after(1400, function () {
      if (state.hp <= 0) {
        gameOver();
        return;
      }
      if (state.phaseIndex < 2) {
        startPhase(state.phaseIndex + 1);
      } else {
        levelClear();
      }
    });
  }

  function levelClear() {
    nextFlow();
    state.busy = true;
    setReady(false);
    hideSpeech();
    FP.play('level');

    const level = LEVELS[state.levelIndex];
    const isFinal = state.levelIndex === LEVELS.length - 1;
    showBanner(isFinal ? 'FINAL BLOW' : 'LEVEL CLEAR', level.name, isFinal ? 'PARIS IS SAVED' : 'THE STREET IS CLEAR');

    after(1300, function () {
      hideBanner();
      if (isFinal) {
        victory();
        return;
      }

      const nextIndex = state.levelIndex + 1;
      const nextLevel = LEVELS[nextIndex];

      enemyRow.style.opacity = '0';
      playerSlot.classList.remove('is-idle');
      playerSlot.classList.add('walking');
      setCamera(nextLevel.cam, true);
      showBanner('ADVANCING', nextLevel.name, '\u2192 \u2192 \u2192');

      after(2700, function () {
        hideBanner();
        playerSlot.classList.remove('walking');
        enemyRow.style.opacity = '';
        startLevel(nextIndex, false);
      });
    });
  }

  function victory() {
    nextFlow();
    state.busy = true;
    state.over = true;
    setReady(false);
    hideSpeech();
    hideBanner();

    getStandingEnemies().forEach(function (slot) {
      slot.classList.remove('speaking');
      slot.classList.add('downed');
      setPose(slot, 'down');
    });
    playerSlot.classList.remove('is-idle');
    setPose(playerSlot, 'atk');
    playerSlot.classList.add('attacking');
    FP.stopMusic();
    FP.play('victory');
    vibrate([40, 60, 40, 60, 100]);
    addFloater('VICTORY!');

    window.setTimeout(function () {
      showOverlay({
        kicker: 'PARIS IS SAVED',
        title: 'VICTORY!',
        sub: 'Mbapp\u00e9 is down. The stadium falls silent. Paris breathes again.',
        stats: [
          { value: state.perfects, label: 'Words nailed' },
          { value: state.misses, label: 'Misses' },
          { value: state.skips, label: 'Skips' }
        ],
        actions: [
          {
            label: 'PLAY AGAIN',
            primary: true,
            onClick: function () {
              hideOverlay();
              state.hp = state.maxHp;
              state.perfects = 0;
              state.misses = 0;
              state.skips = 0;
              state.attempts = 0;
              renderHearts();
              startLevel(0, true);
            }
          },
          {
            label: 'HOME',
            onClick: function () {
              window.location.href = 'index.html';
            }
          }
        ]
      });
    }, 1000);
  }

  function gameOver() {
    nextFlow();
    state.busy = true;
    state.over = true;
    setReady(false);
    hideSpeech();
    hideBanner();
    setPose(playerSlot, 'down');
    playerSlot.classList.add('downed');
    FP.stopMusic();
    FP.play('hurt');
    window.setTimeout(function () {
      FP.play('down');
    }, 240);

    window.setTimeout(function () {
      showOverlay({
        bad: true,
        kicker: 'THE STREET WINS',
        title: 'KNOCKED OUT',
        sub: 'You ran out of hearts. The riots roar on.',
        stats: [
          { value: state.perfects, label: 'Words nailed' },
          { value: state.misses, label: 'Misses' },
          { value: state.skips, label: 'Skips' }
        ],
        actions: [
          {
            label: 'RETRY LEVEL',
            primary: true,
            onClick: function () {
              hideOverlay();
              state.hp = state.maxHp;
              state.over = false;
              state.busy = false;
              renderHearts();
              startLevel(state.levelIndex, true);
            }
          },
          {
            label: 'HOME',
            onClick: function () {
              window.location.href = 'index.html';
            }
          }
        ]
      });
    }, 850);
  }

  /* ---------------------------------------------------------------------
     Pronunciation matching
     --------------------------------------------------------------------- */

  function normalize(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\u2019']/g, ' ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function phonetic(text) {
    return normalize(text)
      .split(' ')
      .filter(Boolean)
      .map(function (word) {
        let key = word
          .replace(/ph/g, 'f')
          .replace(/qu/g, 'k')
          .replace(/q/g, 'k')
          .replace(/c(?=[eiy])/g, 's')
          .replace(/eau/g, 'o')
          .replace(/au/g, 'o')
          .replace(/ai|ei/g, 'e')
          .replace(/ou/g, 'u')
          .replace(/oi/g, 'wa')
          .replace(/eu/g, 'e')
          .replace(/(.)\1+/g, '$1');
        key = key.replace(/(es|s|t|x|d|p|z)$/, '');
        return key;
      })
      .join(' ');
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let previous = [];
    for (let j = 0; j <= b.length; j += 1) previous[j] = j;
    for (let i = 1; i <= a.length; i += 1) {
      const current = [i];
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
        current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      }
      previous = current;
    }
    return previous[b.length];
  }

  function similarity(a, b) {
    if (!a && !b) return 1;
    return 1 - levenshtein(a, b) / Math.max(a.length, b.length, 1);
  }

  function singularize(text) {
    return text.replace(/\b([a-z]{4,})s\b/g, '$1');
  }

  function isMatch(said, target) {
    const s = normalize(said);
    const t = normalize(target);
    if (!s || !t) return false;
    if (s === t) return true;
    if (s.indexOf(t) !== -1) return true;
    if (t.indexOf(s) !== -1 && s.length >= Math.max(3, t.length * 0.6)) return true;
    if (singularize(s) === singularize(t)) return true;
    if (similarity(s, t) >= 0.85) return true;

    const saidWords = s.split(' ');
    const targetWords = t.split(' ');
    const found = function (targetWord) {
      return saidWords.some(function (saidWord) {
        if (saidWord === targetWord) return true;
        if (Math.min(saidWord.length, targetWord.length) < 3) return false;
        return similarity(saidWord, targetWord) >= 0.75;
      });
    };

    if (targetWords.every(found)) return true;

    // Articles are optional: "armes" is enough for "Aux armes !".
    const FILLERS = { les: 1, des: 1, le: 1, la: 1, un: 1, une: 1, aux: 1, a: 1 };
    const coreWords = targetWords.filter(function (word) {
      return !FILLERS[word];
    });
    if (coreWords.length && coreWords.length < targetWords.length && coreWords.every(found)) {
      return true;
    }

    const sp = phonetic(s);
    const tp = phonetic(t);
    if (sp && tp) {
      if (sp === tp) return true;
      if (sp.indexOf(tp) !== -1) return true;
      if (similarity(sp, tp) >= 0.88) return true;
    }
    return false;
  }

  function pickBest(list) {
    const phase = currentPhase();
    const target = phase ? phase.word.fr : '';
    let best = '';
    let bestScore = -1;
    list.forEach(function (candidate) {
      const score = similarity(normalize(candidate), normalize(target));
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    });
    return best;
  }

  /* ---------------------------------------------------------------------
     Speech recognition + microphone meter
     --------------------------------------------------------------------- */

  function setListening(on) {
    micWrap.classList.toggle('listening', on);
    micBtn.setAttribute('aria-pressed', String(on));
    if (!on) {
      micWrap.classList.remove('hearing');
      micWrap.style.setProperty('--lvl', '0');
      micHint.textContent = 'HOLD';
    } else {
      micHint.textContent = 'LISTEN';
    }
  }

  function micDown() {
    if (!state.active || state.busy || holding || state.over) return;
    if (!SpeechRecognitionCtor) {
      showFallback('VOICE NOT SUPPORTED');
      return;
    }

    FP.unlockAudio();
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (error) {
        /* ignore */
      }
    }
    ensureMic();

    holding = true;
    resolved = false;
    listenToken += 1;
    heardFinals = [];
    heardInterim = '';
    restartCount = 0;
    lastError = null;

    setListening(true);
    setStatus('LISTENING\u2026', 'gold');
    setCaption('Say the word now\u2026');
    startRecognition(listenToken);
  }

  function micUp() {
    if (!holding) return;
    holding = false;
    setListening(false);
    if (recognition) {
      try {
        recognition.stop();
      } catch (error) {
        /* ignore */
      }
    }
    const token = listenToken;
    window.setTimeout(function () {
      if (token === listenToken && !resolved) finishListening();
    }, 1000);
  }

  function startRecognition(token) {
    let instance;
    try {
      instance = new SpeechRecognitionCtor();
    } catch (error) {
      showFallback('VOICE UNAVAILABLE');
      return;
    }

    if (recognition) {
      try {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.abort();
      } catch (error) {
        /* ignore */
      }
    }

    recognition = instance;
    instance.lang = 'fr-FR';
    instance.continuous = true;
    instance.interimResults = true;
    instance.maxAlternatives = 5;

    instance.onresult = function (event) {
      if (token !== listenToken) return;
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        for (let j = 0; j < result.length; j += 1) {
          const transcript = (result[j].transcript || '').trim();
          if (transcript && result.isFinal && heardFinals.indexOf(transcript) === -1) {
            heardFinals.push(transcript);
          }
        }
        if (!result.isFinal) {
          interim += ' ' + ((result[0] && result[0].transcript) || '');
        }
      }
      heardInterim = interim.trim();
      const preview = pickBest(heardFinals.concat(heardInterim ? [heardInterim] : []));
      if (preview) setCaption('I hear: \u201c' + preview + '\u201d');
    };

    instance.onerror = function (event) {
      if (token !== listenToken) return;
      lastError = event.error || 'error';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
        showFallback('MIC BLOCKED');
      } else if (event.error === 'network') {
        setStatus('NETWORK ERROR', 'bad');
      }
    };

    instance.onend = function () {
      if (token !== listenToken || resolved) return;
      if (holding && !heardFinals.length && !heardInterim && restartCount < 2 && lastError !== 'not-allowed') {
        restartCount += 1;
        window.setTimeout(function () {
          if (token === listenToken && holding && !resolved) startRecognition(token);
        }, 140);
        return;
      }
      finishListening();
    };

    try {
      instance.start();
    } catch (error) {
      showFallback('VOICE UNAVAILABLE');
    }
  }

  function finishListening() {
    if (resolved) return;
    resolved = true;
    holding = false;
    setListening(false);

    const candidates = heardFinals.length ? heardFinals.slice() : (heardInterim ? [heardInterim] : []);
    const guess = pickBest(candidates) || candidates[0] || '';

    if (!candidates.length) {
      if (lastError === 'network') {
        setStatus('VOICE OFFLINE', 'bad');
        setCaption('Voice needs a connection. Type the word or retry the mic.');
        typeForm.hidden = false;
      } else {
        setStatus('NO SPEECH', 'bad');
        setCaption('I didn\u2019t catch that. Hold the mic and speak.');
      }
      state.busy = false;
      setReady(true);
      return;
    }

    evaluate(guess, candidates);
  }

  function stopRecognition() {
    if (!recognition) return;
    try {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
    } catch (error) {
      /* ignore */
    }
    recognition = null;
  }

  function evaluate(guess, candidates) {
    if (state.busy || state.over) return;
    state.busy = true;
    resolved = true;
    holding = false;
    setListening(false);
    stopRecognition();
    setReady(false);

    const phase = currentPhase();
    if (!phase) return;

    const list = candidates && candidates.length ? candidates : [guess];
    const ok = list.some(function (candidate) {
      return isMatch(candidate, phase.word.fr);
    });

    if (ok) {
      onSuccess(guess || list[0]);
    } else {
      onMiss(guess || list[0]);
    }
  }

  async function ensureMic() {
    if (micStream || micRequested) return;
    micRequested = true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      micRequested = false;
      return;
    }
    try {
      micStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      const context = FP.unlockAudio();
      if (!context) return;
      const source = context.createMediaStreamSource(micStream);
      analyser = context.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.65;
      source.connect(analyser);
      micData = new Uint8Array(analyser.fftSize);
      micLoop();
    } catch (error) {
      micRequested = false;
    }
  }

  function micLoop() {
    if (!analyser || !micData) return;
    analyser.getByteTimeDomainData(micData);
    let sum = 0;
    for (let i = 0; i < micData.length; i += 1) {
      const value = (micData[i] - 128) / 128;
      sum += value * value;
    }
    const rms = Math.sqrt(sum / micData.length);
    const level = Math.max(0, Math.min(1, (rms - 0.012) / 0.16));
    micWrap.style.setProperty('--lvl', level.toFixed(2));
    micWrap.classList.toggle('hearing', holding && rms > 0.026);
    window.requestAnimationFrame(micLoop);
  }

  function showFallback(message) {
    fallbackActive = true;
    resolved = true;
    holding = false;
    setListening(false);
    micBtn.disabled = true;
    micHint.textContent = 'TYPE';
    state.busy = false;
    setStatus(message, 'bad');
    setCaption('Voice is unavailable. Type the French word to keep fighting.');
    typeForm.hidden = false;
  }

  function cleanupMic() {
    if (recognition) {
      try {
        recognition.onend = null;
        recognition.abort();
      } catch (error) {
        /* ignore */
      }
    }
    if (micStream) {
      micStream.getTracks().forEach(function (track) {
        track.stop();
      });
      micStream = null;
    }
    analyser = null;
    micData = null;
  }

  /* ---------------------------------------------------------------------
     Events
     --------------------------------------------------------------------- */

  micBtn.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    if (micBtn.setPointerCapture) {
      try {
        micBtn.setPointerCapture(event.pointerId);
      } catch (error) {
        /* ignore */
      }
    }
    micDown();
  });

  micBtn.addEventListener('pointerup', function (event) {
    event.preventDefault();
    micUp();
  });

  micBtn.addEventListener('pointercancel', micUp);
  micBtn.addEventListener('lostpointercapture', function () {
    if (holding) micUp();
  });
  micBtn.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  });

  micBtn.addEventListener('keydown', function (event) {
    if (event.code === 'Space' && !event.repeat) {
      event.preventDefault();
      micDown();
    }
  });

  micBtn.addEventListener('keyup', function (event) {
    if (event.code === 'Space') {
      event.preventDefault();
      micUp();
    }
  });

  window.addEventListener('pointerup', function () {
    if (holding) micUp();
  });

  replayBtn.addEventListener('click', function () {
    const phase = currentPhase();
    if (!phase) return;
    FP.unlockAudio();
    FP.play('click');
    FP.speak(phase.word.fr, { rate: 0.72 });
    replayBtn.classList.add('playing');
    window.setTimeout(function () {
      replayBtn.classList.remove('playing');
    }, 450);
  });

  skipBtn.addEventListener('click', skipWord);

  typeForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (state.busy || state.over) return;
    const value = typeInput.value.trim();
    if (!value) return;
    typeInput.value = '';
    typeInput.blur();
    FP.unlockAudio();
    evaluate(value, [value]);
  });

  window.addEventListener('pagehide', cleanupMic);

  /* ---------------------------------------------------------------------
     Boot
     --------------------------------------------------------------------- */

  buildHearts();
  initPlayer();
  startGame();

  /* Tiny debug hook: game.html?debug=1 exposes a way to simulate a word. */
  if (params.has('debug')) {
    window.__FP_DEBUG = {
      state: state,
      phase: currentPhase,
      say: function (word) {
        evaluate(word, [word]);
      },
      match: function (said, target) {
        return isMatch(said, target);
      },
      jump: function (levelIndex, phaseIndex) {
        const level = LEVELS[levelIndex];
        if (!level) return;
        const phase = level.phases[phaseIndex || 0];
        if (!phase) return;
        nextFlow();
        hideOverlay();
        hideBanner();
        state.levelIndex = levelIndex;
        state.phaseIndex = phaseIndex || 0;
        state.hp = state.maxHp;
        state.busy = false;
        state.over = false;
        renderHearts();
        levelNum.textContent = String(level.n);
        levelTag.textContent = 'LVL ' + level.n + ' \u00b7 ' + level.name;
        setCamera(level.cam, false);
        preloadLevel(level);
        renderPips();
        renderEnemies(phase);
        updateSpeech(phase);
        setPose(playerSlot, 'stand');
        playerSlot.classList.remove('downed', 'hurt', 'attacking', 'walking');
        setStatus('READY', '');
        setCaption('Hold the mic and pronounce the word');
        setReady(true);
      },
      gameOver: gameOver,
      skip: skipWord,
      micDown: micDown,
      micUp: micUp
    };
  }
})();
