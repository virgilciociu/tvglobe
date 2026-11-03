// Globe - favorites and history (stored only in this browser) and their drawer.

const FAV_KEY = 'globe-favorites';
const HIST_KEY = 'globe-history';
const HIST_MAX = 20;

function loadList(key) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(v) ? v : [];
  } catch (e) {
    return [];
  }
}

function saveList(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch (e) { /* storage not available */ }
}

let favorites = loadList(FAV_KEY);   // ["RO:TVR1.ro", ...]
let history = loadList(HIST_KEY);    // ["RO:TVR1.ro", ...] newest first
let libraryTab = 'fav';

const chKey = (code, id) => `${code}:${id}`;

function findChannelByKey(key) {
  const [code, ...rest] = key.split(':');
  const id = rest.join(':');
  const list = (window.CHANNELS && window.CHANNELS[code]) || [];
  const channel = list.find(c => c.id === id);
  return channel ? { code, channel } : null;
}

function isFavorite(code, id) {
  return favorites.includes(chKey(code, id));
}

function toggleFavorite(code, id) {
  const key = chKey(code, id);
  favorites = favorites.includes(key) ? favorites.filter(k => k !== key) : [key, ...favorites];
  saveList(FAV_KEY, favorites);
  renderLibrary();
  if (typeof renderChannels === 'function') renderChannels();
}

function addHistory(code, id) {
  const key = chKey(code, id);
  history = [key, ...history.filter(k => k !== key)].slice(0, HIST_MAX);
  saveList(HIST_KEY, history);
  renderLibrary();
}

function clearHistory() {
  history = [];
  saveList(HIST_KEY, history);
  renderLibrary();
}

// --- Drawer ---------------------------------------------------------------

const libraryEl = document.getElementById('library');
const libraryBtn = document.getElementById('library-btn');
const libraryClose = document.getElementById('library-close');
const tabFav = document.getElementById('tab-fav');
const tabHist = document.getElementById('tab-hist');
const libraryActions = document.getElementById('library-actions');
const libraryEmpty = document.getElementById('library-empty');
const libraryList = document.getElementById('library-list');

function renderLibrary() {
  tabFav.classList.toggle('active', libraryTab === 'fav');
  tabHist.classList.toggle('active', libraryTab === 'hist');

  const keys = libraryTab === 'fav' ? favorites : history;
  const items = keys.map(findChannelByKey).filter(Boolean);

  libraryList.innerHTML = '';
  libraryEmpty.textContent = items.length ? '' : t(libraryTab === 'fav' ? 'noFavorites' : 'noHistory');

  libraryActions.innerHTML = '';
  if (libraryTab === 'hist' && items.length) {
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'library-clear';
    clear.textContent = t('clearHistory');
    clear.addEventListener('click', clearHistory);
    libraryActions.appendChild(clear);
  }

  for (const { code, channel } of items) {
    const li = document.createElement('li');
    li.className = 'library-item';

    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'library-open';

    const flag = document.createElement('img');
    flag.className = 'library-flag';
    flag.alt = '';
    flag.src = `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

    const text = document.createElement('span');
    text.className = 'library-text';
    const name = document.createElement('span');
    name.className = 'library-name';
    name.textContent = channel.name;
    const country = document.createElement('span');
    country.className = 'library-country';
    country.textContent = displayCountry(code) || code;
    text.appendChild(name);
    text.appendChild(country);

    open.appendChild(flag);
    open.appendChild(text);
    open.addEventListener('click', () => {
      closeLibrary();
      if (typeof openChannel === 'function') openChannel(code, channel.id);
    });
    li.appendChild(open);

    if (libraryTab === 'fav') {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'fav-btn active';
      remove.textContent = '★';
      remove.setAttribute('aria-label', t('removeFavorite'));
      remove.addEventListener('click', () => toggleFavorite(code, channel.id));
      li.appendChild(remove);
    }
    libraryList.appendChild(li);
  }
}

function openLibrary(tab) {
  if (tab) libraryTab = tab;
  renderLibrary();
  libraryEl.classList.add('open');
}

function closeLibrary() {
  libraryEl.classList.remove('open');
}

libraryBtn.addEventListener('click', () => {
  if (libraryEl.classList.contains('open')) closeLibrary();
  else openLibrary();
});
libraryClose.addEventListener('click', closeLibrary);
tabFav.addEventListener('click', () => { libraryTab = 'fav'; renderLibrary(); });
tabHist.addEventListener('click', () => { libraryTab = 'hist'; renderLibrary(); });

renderLibrary();
