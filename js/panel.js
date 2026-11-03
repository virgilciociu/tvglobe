// TV Globe - side panel: country name, flag, local time, channel list and player.

const panel = document.getElementById('panel');
const panelFlag = document.getElementById('panel-flag');
const panelName = document.getElementById('panel-name');
const panelTimeRow = document.getElementById('panel-time-row');
const panelTimeLabel = document.getElementById('panel-time-label');
const panelTime = document.getElementById('panel-time');
const panelDate = document.getElementById('panel-date');
const panelClose = document.getElementById('panel-close');
const channelList = document.getElementById('channel-list');
const channelSearch = document.getElementById('channel-search');
const channelsEmpty = document.getElementById('channels-empty');
const playerWrap = document.getElementById('player-wrap');
const playerEl = document.getElementById('player');
const playerMsg = document.getElementById('player-msg');
const playerTitle = document.getElementById('player-title');
const embedFrame = document.getElementById('embed-frame');
const embedNote = document.getElementById('embed-note');
const embedHint = document.getElementById('embed-hint');
const embedLink = document.getElementById('embed-link');

let clockTimer = null;
let currentTimeZone = null;
let currentChannels = [];
let hls = null;
let playingId = null;
let currentCountry = null;
let currentCode = null;
let stallTimer = null;
const STALL_MS = 15000;


// Natural Earth has no ISO code for a few countries (France, Norway), so we add them by name.
const NAME_CODES = { 'France': 'FR', 'Norway': 'NO' };

function countryCode(country) {
  const p = country.properties;
  const valid = c => (c && c !== '-99' ? c : null);
  return valid(p.ISO_A2) || valid(p.ISO_A2_EH) || NAME_CODES[p.NAME || p.ADMIN] || null;
}

// Territories without a capital city: the label says only "official time".
const NO_CAPITAL = ['AQ', 'TF'];

function updateTimeLabel() {
  const noCapital = currentCode && NO_CAPITAL.includes(currentCode);
  panelTimeLabel.textContent = t(noCapital ? 'officialTime' : 'localTime');
}

function countryTimeZone(country) {
  const code = countryCode(country);
  const byCode = code && window.COUNTRY_TIMEZONES ? window.COUNTRY_TIMEZONES[code] : null;
  const name = country.properties.NAME || country.properties.ADMIN;
  return byCode || (window.COUNTRY_TIMEZONES_BY_NAME && window.COUNTRY_TIMEZONES_BY_NAME[name]) || null;
}

function channelsFor(code) {
  return (code && window.CHANNELS && window.CHANNELS[code]) || [];
}

// --- Clock ----------------------------------------------------------------

function updateClock() {
  if (!currentTimeZone) return;
  const now = new Date();
  const locale = currentLocale();
  panelTime.textContent = new Intl.DateTimeFormat(locale, {
    timeZone: currentTimeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(now);
  panelDate.textContent = new Intl.DateTimeFormat(locale, {
    timeZone: currentTimeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  }).format(now);
}

// --- Player ---------------------------------------------------------------

function destroyHls() {
  clearTimeout(stallTimer);
  if (hls) {
    hls.destroy();
    hls = null;
  }
}

// --- Send to TV. One button, two technologies:
//  - AirPlay (Safari on iPhone/iPad/Mac), built into the browser;
//  - Chromecast (Chrome on Android/desktop), through the Google Cast sender script.
// Shown only when a TV is nearby and a stream is playing directly (official embedded
// players cannot be sent).
const castBtn = document.getElementById('cast-btn');
let airplayAvailable = false;
let castAvailable = false;
let currentStreamUrl = null;

function setCastVisible(on) {
  castBtn.hidden = !(on && (airplayAvailable || castAvailable) && !playerEl.hidden);
}

if (window.WebKitPlaybackTargetAvailabilityEvent && playerEl.webkitShowPlaybackTargetPicker) {
  playerEl.addEventListener('webkitplaybacktargetavailabilitychanged', e => {
    airplayAvailable = e.availability === 'available';
    setCastVisible(!playerEl.paused || !!playerEl.currentSrc);
  });
} else {
  // Not Safari: load the Google Cast sender (only then, to avoid needless third-party requests).
  window.__onGCastApiAvailable = ok => { if (ok) initChromecast(); };
  const castScript = document.createElement('script');
  castScript.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
  castScript.async = true;
  document.head.appendChild(castScript);
}

function initChromecast() {
  const ctx = cast.framework.CastContext.getInstance();
  ctx.setOptions({
    receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
  });
  const update = () => {
    castAvailable = ctx.getCastState() !== cast.framework.CastState.NO_DEVICES_AVAILABLE;
    setCastVisible(!playerWrap.hidden);
  };
  ctx.addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, update);
  update();
}

function chromecastSession() {
  if (!castAvailable) return null;
  return cast.framework.CastContext.getInstance().getCurrentSession();
}

function sendToChromecast() {
  const session = chromecastSession();
  if (!session || !currentStreamUrl) return;
  const info = new chrome.cast.media.MediaInfo(currentStreamUrl, 'application/x-mpegURL');
  info.streamType = chrome.cast.media.StreamType.LIVE;
  info.metadata = new chrome.cast.media.GenericMediaMetadata();
  info.metadata.title = playerTitle.textContent;
  session.loadMedia(new chrome.cast.media.LoadRequest(info))
    .then(() => playerEl.pause())
    .catch(() => showPlayerMessage('playError'));
}

castBtn.addEventListener('click', () => {
  if (airplayAvailable && playerEl.webkitShowPlaybackTargetPicker) {
    playerEl.webkitShowPlaybackTargetPicker();
  } else if (castAvailable) {
    if (chromecastSession()) { sendToChromecast(); return; }
    cast.framework.CastContext.getInstance().requestSession()
      .then(err => { if (!err) sendToChromecast(); })
      .catch(() => {});
  }
});

function stopPlayer() {
  destroyHls();
  exitNativeFs();
  document.body.classList.remove('embed-on');
  setCastVisible(false);
  embedFrame.hidden = true;
  embedFrame.src = 'about:blank';
  embedNote.hidden = true;
  playerEl.hidden = false;
  playerEl.pause();
  playerEl.removeAttribute('src');
  playerEl.load();
  playerWrap.hidden = true;
  showPlayerMessage('');
  playingId = null;
  markPlaying();
  updateTheater();
}

let playerMsgKey = '';
function showPlayerMessage(key) {
  playerMsgKey = key;
  playerMsg.textContent = key ? t(key) : '';
  playerMsg.style.display = key ? '' : 'none';
}

const IS_SAFARI = !!window.WebKitPlaybackTargetAvailabilityEvent;
let playToken = 0;
let hlsLibPromise = null;

// hls.js (about 600 KB) is downloaded only when a stream is played for the first time.
function loadHlsLib() {
  if (window.Hls) return Promise.resolve();
  if (!hlsLibPromise) {
    hlsLibPromise = new Promise(resolve => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1';
      s.onload = resolve;
      s.onerror = () => { hlsLibPromise = null; resolve(); };
      document.head.appendChild(s);
    });
  }
  return hlsLibPromise;
}

function playUrl(urls, index) {
  destroyHls();
  const url = urls[index];
  currentStreamUrl = url;
  if (chromecastSession()) sendToChromecast();
  const tryNext = () => {
    if (index + 1 < urls.length) {
      playUrl(urls, index + 1);
    } else {
      showPlayerMessage('playError');
    }
  };

  showPlayerMessage('loading');
  const myToken = playToken + 1;
  stallTimer = setTimeout(() => {
    if (myToken !== playToken) return;
    destroyHls();
    tryNext();
  }, STALL_MS);

  const token = ++playToken;
  const nativeHls = () => {
    playerEl.src = url;
    playerEl.onerror = tryNext;
    playerEl.play().catch(() => {});
  };
  const hlsJs = () => {
    hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(playerEl);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      playerEl.play().catch(() => {});
    });
    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (data.fatal) tryNext();
    });
  };

  if (IS_SAFARI && playerEl.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari / iOS: native HLS (also needed for AirPlay). hls.js is not even downloaded.
    nativeHls();
  } else {
    loadHlsLib().then(() => {
      if (token !== playToken) return; // another channel was chosen meanwhile
      if (window.Hls && Hls.isSupported()) hlsJs();
      else if (playerEl.canPlayType('application/vnd.apple.mpegurl')) nativeHls();
      else showPlayerMessage('playError');
    });
  }
}

playerEl.addEventListener('playing', () => {
  setCastVisible(true);
  clearTimeout(stallTimer);
  showPlayerMessage('');
});

function playEmbedded(channel) {
  currentStreamUrl = null;
  setCastVisible(false);
  destroyHls();
  playerEl.pause();
  playerEl.hidden = true;
  showPlayerMessage('');
  embedFrame.hidden = false;
  // https only: an http page inside an https site would be blocked by the browser.
  embedFrame.src = channel.website.replace(/^http:\/\//, 'https://');
  embedHint.textContent = t('embedHint');
  embedLink.href = channel.website;
  embedLink.textContent = t('openOfficial') + ' ↗';
  embedNote.hidden = false;
}

function playChannel(channel) {
  playingId = channel.id;
  if (currentCode) addHistory(currentCode, channel.id);
  playerWrap.hidden = false;
  playerTitle.textContent = channel.name;
  markPlaying();
  if (channel.restricted) {
    playEmbedded(channel);
  } else {
    embedFrame.hidden = true;
    embedFrame.src = 'about:blank';
    embedNote.hidden = true;
    playerEl.hidden = false;
    playUrl(channel.urls, 0);
  }
  document.body.classList.toggle('embed-on', !!channel.restricted);
  updateTheater();
  playerWrap.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function playChannelById(id) {
  const channel = currentChannels.find(c => c.id === id);
  if (channel) playChannel(channel);
}

// --- Channel list ---------------------------------------------------------

function markPlaying() {
  for (const li of channelList.children) {
    li.classList.toggle('playing', li.dataset.id === playingId);
  }
}

function renderChannels() {
  const query = channelSearch.value.trim().toLowerCase();
  channelList.innerHTML = '';

  const visible = currentChannels.filter(c => c.name.toLowerCase().includes(query));

  channelsEmpty.textContent = '';
  channelsEmpty.classList.remove('notice');
  if (!currentChannels.length) {
    channelsEmpty.textContent = t('noChannels');
    channelsEmpty.classList.add('notice');
  } else if (!visible.length) {
    channelsEmpty.textContent = t('noResults');
  }

  // Playable channels first, link-only channels after them.
  const sorted = [...visible].sort((a, b) => Number(!!a.restricted) - Number(!!b.restricted));
  zapList = sorted.filter(c => !(c.restricted && c.embeddable === false));

  for (const channel of sorted) {
    const li = document.createElement('li');
    li.dataset.id = channel.id;

    if (channel.restricted && channel.embeddable === false) {
      // The site does not allow embedding: link only.
      li.className = 'channel link-only';
      const a = document.createElement('a');
      a.className = 'channel-main';
      a.href = channel.website;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = channel.name;
      const tag = document.createElement('span');
      tag.className = 'channel-tag';
      tag.textContent = t('officialSite') + ' ↗';
      a.appendChild(tag);
      li.appendChild(a);
    } else {
      li.className = 'channel';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'channel-main';
      btn.textContent = channel.name;
      const tagText = channel.restricted
        ? t('officialPlayer')
        : (channel.categories && channel.categories.length ? tCategory(channel.categories[0]) : '');
      if (tagText) {
        const tag = document.createElement('span');
        tag.className = 'channel-tag';
        tag.textContent = tagText;
        btn.appendChild(tag);
      }
      btn.addEventListener('click', () => playChannel(channel));
      li.appendChild(btn);
    }

    if (currentCode) {
      const fav = isFavorite(currentCode, channel.id);
      const star = document.createElement('button');
      star.type = 'button';
      star.className = 'fav-btn' + (fav ? ' active' : '');
      star.textContent = fav ? '★' : '☆';
      star.setAttribute('aria-label', t(fav ? 'removeFavorite' : 'addFavorite'));
      star.addEventListener('click', () => toggleFavorite(currentCode, channel.id));
      li.appendChild(star);
    }
    channelList.appendChild(li);
  }
  markPlaying();
}

channelSearch.addEventListener('input', renderChannels);

// --- Open / close ---------------------------------------------------------

function openPanel(country) {
  setExpanded(false);
  const code = countryCode(country);
  currentCountry = country;
  currentCode = code;
  panelName.textContent = displayCountry(code) || country.properties.NAME || country.properties.ADMIN;

  if (code) {
    panelFlag.src = `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
    panelFlag.style.display = '';
  } else {
    panelFlag.style.display = 'none';
  }

  currentTimeZone = countryTimeZone(country);
  updateTimeLabel();
  panelTimeRow.style.display = currentTimeZone ? '' : 'none';

  clearInterval(clockTimer);
  if (currentTimeZone) {
    updateClock();
    clockTimer = setInterval(updateClock, 1000);
  }

  stopPlayer();
  channelSearch.value = '';
  currentChannels = channelsFor(code);
  channelSearch.style.display = currentChannels.length ? '' : 'none';
  renderChannels();

  panel.classList.add('open');
}

function closePanel() {
  currentCountry = null;
  currentCode = null;
  panel.classList.remove('open');
  setExpanded(false);
  clearInterval(clockTimer);
  currentTimeZone = null;
  stopPlayer();
}

panelClose.addEventListener('click', () => {
  if (typeof clearSelection === 'function') clearSelection();
});

// Called by i18n.js when the language changes.
function onLanguageChange() {
  renderLibrary();
  updateTimeLabel();
  if (!currentCountry) return;
  const code = countryCode(currentCountry);
  panelName.textContent = displayCountry(code) || currentCountry.properties.NAME || currentCountry.properties.ADMIN;
  updateClock();
  renderChannels();
  showPlayerMessage(playerMsgKey);
  if (!embedNote.hidden) {
    embedHint.textContent = t('embedHint');
    embedLink.textContent = t('openOfficial') + ' ↗';
  }
}

// --- Phone: the panel grows to full screen when the channel list is scrolled.
// The player stays pinned at the top; only the channel list scrolls.
const panelScroll = document.getElementById('panel-scroll');
const channelSearchInput = document.getElementById('channel-search');
const isPhoneLayout = () => window.innerWidth <= 700;

function setExpanded(on) {
  const next = on && isPhoneLayout();
  if (panel.classList.contains('expanded') === next) return;
  panel.classList.toggle('expanded', next);
  if (!next) panelScroll.scrollTop = 0;
}

let touchStartY = null;
panel.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
panel.addEventListener('touchmove', e => {
  if (touchStartY === null || !isPhoneLayout()) return;
  const dy = touchStartY - e.touches[0].clientY;
  if (dy > 24) setExpanded(true);
  else if (dy < -60 && panelScroll.scrollTop <= 0) setExpanded(false);
}, { passive: true });
panel.addEventListener('touchend', () => { touchStartY = null; }, { passive: true });
panelScroll.addEventListener('scroll', () => { if (panelScroll.scrollTop > 0) setExpanded(true); }, { passive: true });
channelSearchInput.addEventListener('focus', () => setExpanded(true));
window.addEventListener('resize', () => { if (!isPhoneLayout()) setExpanded(false); });

// --- Channel zapping: previous / next channel, like a TV remote ------------
let zapList = [];

function zap(step) {
  if (!zapList.length) return;
  const i = zapList.findIndex(c => c.id === playingId);
  const next = zapList[(i + step + zapList.length) % zapList.length];
  playChannel(next);
  const li = [...channelList.children].find(el => el.dataset.id === next.id);
  if (li) li.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
document.getElementById('zap-prev').addEventListener('click', () => zap(-1));
document.getElementById('zap-next').addEventListener('click', () => zap(1));


// --- Landscape = theater mode, plus real full screen --------------------------
// 1. Phone turned sideways while a channel plays: the player fills the screen (pure CSS
//    layout, works everywhere, no user gesture needed).
// 2. One tap in that mode asks the browser for real full screen (needs a gesture).
// 3. A full-screen button does the same for people whose phone rotation is locked.
const fsBtn = document.getElementById('fs-btn');
const backBtn = document.getElementById('back-btn');
const fsHint = document.getElementById('fs-hint');
const landscapeMQ = window.matchMedia('(orientation: landscape) and (max-height: 500px)');
let uiTimer = null;
let hintTimer = null;
let autoFsTried = false;
let theaterDismissed = false;

const fsElement = () => document.fullscreenElement || document.webkitFullscreenElement || null;

function canNativeFs() {
  if (playerWrap.requestFullscreen || playerWrap.webkitRequestFullscreen) return true;
  // iPhone: only the <video> element can go full screen.
  return !playerEl.hidden && !!playerEl.webkitEnterFullscreen;
}

function enterNativeFs() {
  if (fsElement()) return;
  try {
    const req = playerWrap.requestFullscreen || playerWrap.webkitRequestFullscreen;
    if (req) {
      const lock = () => {
        if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
      };
      const p = req.call(playerWrap);
      if (p && p.then) p.then(lock).catch(() => {}); else lock();
    } else if (!playerEl.hidden && playerEl.webkitEnterFullscreen) {
      playerEl.webkitEnterFullscreen();
    }
  } catch (e) { /* not allowed right now (no user gesture, or no metadata yet) */ }
}

function exitNativeFs() {
  if (!fsElement()) return;
  const exit = document.exitFullscreen || document.webkitExitFullscreen;
  try { const p = exit.call(document); if (p && p.catch) p.catch(() => {}); } catch (e) { /* ignore */ }
}

// Controls over the video: shown on touch, hidden after 3 seconds.
function pokeUi() {
  document.body.classList.add('ui-on');
  clearTimeout(uiTimer);
  uiTimer = setTimeout(() => document.body.classList.remove('ui-on'), 3000);
}

function showFsHint() {
  fsHint.classList.add('show');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => fsHint.classList.remove('show'), 3500);
}

function updateTheater() {
  const on = landscapeMQ.matches && !theaterDismissed && !playerWrap.hidden && panel.classList.contains('open');
  const was = document.body.classList.contains('theater');
  document.body.classList.toggle('theater', on);
  fsBtn.hidden = playerWrap.hidden || !canNativeFs();
  if (!embedFrame.hidden) fsHint.classList.remove('show'); // official players take the taps themselves
  if (on === was) return;
  // The globe is hidden behind the video: stop drawing it to save battery.
  if (typeof globe !== 'undefined' && globe.pauseAnimation) on ? globe.pauseAnimation() : globe.resumeAnimation();
  if (on) {
    autoFsTried = false;
    pokeUi();
    if (!embedFrame.hidden || !canNativeFs()) return;
    showFsHint();
  } else {
    fsHint.classList.remove('show');
  }
}

const onOrientation = () => { theaterDismissed = false; updateTheater(); };
if (landscapeMQ.addEventListener) landscapeMQ.addEventListener('change', onOrientation);
else landscapeMQ.addListener(onOrientation);

function onFullscreenChange() {
  const on = !!fsElement();
  document.body.classList.toggle('is-fs', on);
  if (on) {
    fsHint.classList.remove('show');
    pokeUi();
  } else if (screen.orientation && screen.orientation.unlock) {
    try { screen.orientation.unlock(); } catch (e) { /* ignore */ }
  }
}
document.addEventListener('fullscreenchange', onFullscreenChange);
document.addEventListener('webkitfullscreenchange', onFullscreenChange);

playerWrap.addEventListener('pointerdown', pokeUi, { passive: true });
playerWrap.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') pokeUi(); }, { passive: true });
// First tap in theater mode = the user gesture that real full screen needs (tried once per rotation).
playerWrap.addEventListener('click', e => {
  if (!document.body.classList.contains('theater') || fsElement() || autoFsTried) return;
  if (e.target.closest('.player-bar')) return;
  autoFsTried = true;
  enterNativeFs();
});

fsBtn.addEventListener('click', () => { if (fsElement()) exitNativeFs(); else enterNativeFs(); });
// Back to the channel list while the phone stays sideways.
backBtn.addEventListener('click', () => {
  theaterDismissed = true;
  exitNativeFs();
  updateTheater();
});
