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

// --- Send to TV (AirPlay). Shown only when Safari reports a nearby AirPlay target
// and a stream is playing directly (official embedded players cannot be sent).
const castBtn = document.getElementById('cast-btn');
let airplayAvailable = false;

function setCastVisible(on) {
  castBtn.hidden = !(on && airplayAvailable && !playerEl.hidden);
}

if (window.WebKitPlaybackTargetAvailabilityEvent && playerEl.webkitShowPlaybackTargetPicker) {
  playerEl.addEventListener('webkitplaybacktargetavailabilitychanged', e => {
    airplayAvailable = e.availability === 'available';
    setCastVisible(!playerEl.paused || !!playerEl.currentSrc);
  });
  castBtn.addEventListener('click', () => playerEl.webkitShowPlaybackTargetPicker());
}

function stopPlayer() {
  destroyHls();
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
}

let playerMsgKey = '';
function showPlayerMessage(key) {
  playerMsgKey = key;
  playerMsg.textContent = key ? t(key) : '';
  playerMsg.style.display = key ? '' : 'none';
}

function playUrl(urls, index) {
  destroyHls();
  const url = urls[index];
  const tryNext = () => {
    if (index + 1 < urls.length) {
      playUrl(urls, index + 1);
    } else {
      showPlayerMessage('playError');
    }
  };

  showPlayerMessage('loading');
  stallTimer = setTimeout(() => {
    destroyHls();
    tryNext();
  }, STALL_MS);

  if (window.Hls && Hls.isSupported()) {
    hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(playerEl);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      playerEl.play().catch(() => {});
    });
    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (data.fatal) tryNext();
    });
  } else if (playerEl.canPlayType('application/vnd.apple.mpegurl')) {
    // Safari / iOS: native HLS
    playerEl.src = url;
    playerEl.onerror = tryNext;
    playerEl.play().catch(() => {});
  } else {
    showPlayerMessage('playError');
  }
}

playerEl.addEventListener('playing', () => {
  setCastVisible(true);
  clearTimeout(stallTimer);
  showPlayerMessage('');
});

function playEmbedded(channel) {
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
