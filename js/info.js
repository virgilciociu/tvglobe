// Globe - info page: builds the per-country channel summary from data/channels.js.

const summaryEl = document.getElementById('channel-summary');

function renderSummary() {
  summaryEl.innerHTML = '';
  const all = window.CHANNELS || {};

  const codes = Object.keys(all).sort((a, b) =>
    (displayCountry(a) || a).localeCompare(displayCountry(b) || b, currentLocale())
  );

  for (const code of codes) {
    const list = all[code];
    const official = list.filter(c => c.restricted);
    const direct = list.length - official.length;

    const block = document.createElement('div');
    block.className = 'card';

    const title = document.createElement('h3');
    title.textContent = t('countryLine')
      .replace('{country}', displayCountry(code) || code)
      .replace('{direct}', direct)
      .replace('{official}', official.length);
    block.appendChild(title);

    if (official.length) {
      const label = document.createElement('p');
      label.className = 'summary-label';
      label.textContent = t('officialNames');
      block.appendChild(label);

      const names = document.createElement('p');
      names.className = 'summary-names';
      names.textContent = official.map(c => c.name).join(', ');
      block.appendChild(names);
    }
    summaryEl.appendChild(block);
  }
}

// Called by i18n.js when the language changes.
function onLanguageChange() {
  renderSummary();
  document.title = t('navInfo') + ' - Globe';
}

renderSummary();
document.title = t('navInfo') + ' - Globe';
