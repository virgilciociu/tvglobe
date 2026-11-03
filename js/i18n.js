// TV Globe - language handling.
// The language is taken from the phone/browser settings (en, de, ro, fr, es; English as fallback).
// A manual choice from the language selector is remembered.

const SUPPORTED_LANGS = ['en', 'de', 'ro', 'fr', 'es'];
const LANG_STORAGE_KEY = 'tvglobe-lang';

function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (SUPPORTED_LANGS.includes(saved)) return saved;
  } catch (e) { /* storage not available */ }

  const preferred = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || 'en'];
  for (const l of preferred) {
    const short = String(l).slice(0, 2).toLowerCase();
    if (SUPPORTED_LANGS.includes(short)) return short;
  }
  return 'en';
}

let currentLang = detectLang();

function t(key) {
  const dict = window.I18N[currentLang] || {};
  return dict[key] || window.I18N.en[key] || key;
}

function tCategory(cat) {
  const dict = (window.I18N[currentLang] || {}).categories || {};
  return dict[cat] || window.I18N.en.categories[cat] || cat;
}

// Locale used for dates and times (24h clock for English).
function currentLocale() {
  if (currentLang !== 'en') return currentLang;
  const nav = navigator.language || '';
  return nav.toLowerCase().startsWith('en') ? nav : 'en-GB';
}

// Country name in the current language (null if the browser cannot translate it).
function displayCountry(code) {
  if (!code) return null;
  try {
    const name = new Intl.DisplayNames([currentLocale()], { type: 'region' }).of(code);
    return name && name !== code ? name : null;
  } catch (e) {
    return null;
  }
}

function applyStaticTexts() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  const select = document.getElementById('lang-select');
  if (select) select.value = currentLang;
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang)) return;
  currentLang = lang;
  try { localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  applyStaticTexts();
  if (typeof onLanguageChange === 'function') onLanguageChange();
}

document.getElementById('lang-select').addEventListener('change', e => setLang(e.target.value));
applyStaticTexts();
