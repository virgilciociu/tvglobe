// Globe - channel list builder.
//
// Reads the public iptv-org API, keeps only streams that really play in a browser
// (https, HLS, CORS-enabled, answering right now) and merges the result into
// data/channels.js. Countries that are not rebuilt are left untouched.
//
// Usage (from the project folder):
//   node scripts/build-channels.js CZ          -> add a new country
//   node scripts/build-channels.js CZ SE       -> several countries
//   node scripts/build-channels.js --refresh RO -> re-test a country already in the file
//                                                  (its "restricted" official entries are kept)

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const rules = require('./channel-rules');

const API = 'https://iptv-org.github.io/api';
const OUT_FILE = path.join(__dirname, '..', 'data', 'channels.js');
const TIMEOUT_MS = 8000;
const CONCURRENCY = 30;
const MAX_URLS_PER_CHANNEL = 2;

async function getJson(name, fetchFn) {
  const res = await fetchFn(`${API}/${name}.json`);
  if (!res.ok) throw new Error(`${name}.json: HTTP ${res.status}`);
  return res.json();
}

// Checks one stream: must answer, be an HLS playlist and allow browser access (CORS).
async function checkStream(url, fetchFn) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetchFn(url, { signal: controller.signal, headers: { Origin: 'null' } });
    if (!res.ok) return false;
    if (res.headers.get('access-control-allow-origin') !== '*') return false;
    const reader = res.body.getReader();
    const { value } = await reader.read();
    reader.cancel().catch(() => {});
    if (!value) return false;
    const head = new TextDecoder().decode(value.slice(0, 64)).replace(/^﻿/, '');
    return head.trimStart().startsWith('#EXTM3U');
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function runPool(items, worker, quiet) {
  let index = 0, done = 0;
  async function next() {
    while (index < items.length) {
      const i = index++;
      await worker(items[i], i);
      done++;
      if (!quiet && (done % 50 === 0 || done === items.length)) {
        process.stdout.write(`\rTested ${done}/${items.length} streams`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, next));
  if (!quiet) process.stdout.write('\n');
}

function readExisting(file) {
  if (!fs.existsSync(file)) return {};
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox);
  return sandbox.window.CHANNELS || {};
}

function normCountry(c) {
  const up = String(c || '').toUpperCase();
  return rules.COUNTRY_ALIASES[up] || up;
}

// Pure selection step: which channels/streams are even worth testing.
function selectCandidates(channels, streams, blocklist, countries) {
  const blocked = new Set(blocklist.map(b => b.channel));
  const byId = new Map();
  for (const ch of channels) {
    if (!ch.country || ch.is_nsfw || ch.closed || blocked.has(ch.id)) continue;
    const country = normCountry(ch.country);
    if (!countries.includes(country)) continue;
    if (rules.EXCLUDE.test(ch.name) || rules.COMMERCIAL.test(ch.name)) continue;
    byId.set(ch.id, { ...ch, country });
  }
  const candidates = streams.filter(s =>
    s.channel && byId.has(s.channel) && s.url &&
    s.url.startsWith('https://') && /\.m3u8(\?|$)/i.test(s.url) &&
    !s.user_agent && !s.referrer && !rules.BAD_URL.test(s.url));
  return { byId, candidates };
}

// Pure ordering/capping step.
function buildCountry(code, list) {
  list.sort((a, b) => {
    const pa = rules.PUBLIC_PRIORITY.test(a.name) ? 0 : a.website ? 1 : 2;
    const pb = rules.PUBLIC_PRIORITY.test(b.name) ? 0 : b.website ? 1 : 2;
    return pa - pb || a.name.localeCompare(b.name);
  });
  return list.slice(0, rules.CAPS[code] || rules.DEFAULT_CAP);
}

async function build({ countries, refresh = false, fetchFn = fetch, outFile = OUT_FILE, quiet = false }) {
  const log = (...a) => { if (!quiet) console.log(...a); };
  const existing = readExisting(outFile);

  const todo = countries.filter(c => {
    if (existing[c] && !refresh) { log(`Skipping ${c}: already in the file (use --refresh).`); return false; }
    return true;
  });
  if (!todo.length) { log('Nothing to do.'); return existing; }

  log('Downloading iptv-org data...');
  const [channels, streams, blocklist] = await Promise.all(
    ['channels', 'streams', 'blocklist'].map(n => getJson(n, fetchFn)));

  const { byId, candidates } = selectCandidates(channels, streams, blocklist, todo);
  log(`Channels: ${byId.size}, candidate streams: ${candidates.length}`);

  const working = [];
  await runPool(candidates, async s => { if (await checkStream(s.url, fetchFn)) working.push(s); }, quiet);

  const urlsByChannel = new Map();
  for (const s of working) {
    if (!urlsByChannel.has(s.channel)) urlsByChannel.set(s.channel, []);
    urlsByChannel.get(s.channel).push(s.url);
  }

  const result = { ...existing };
  for (const code of todo) {
    const list = [];
    for (const [id, urls] of urlsByChannel) {
      const ch = byId.get(id);
      if (ch.country !== code) continue;
      const entry = { id: ch.id, name: ch.name, categories: ch.categories || [] };
      if (ch.website) entry.website = ch.website;
      entry.urls = urls.slice(0, MAX_URLS_PER_CHANNEL);
      list.push(entry);
    }
    const playable = buildCountry(code, list);
    // Keep hand-curated official entries when refreshing.
    const kept = (existing[code] || []).filter(c => c.restricted && !playable.some(p => p.id === c.id));
    result[code] = playable.concat(kept);
    log(`${code}: ${playable.length} playable, ${kept.length} official kept`);
  }

  const codes = Object.keys(result).sort();
  const header =
    `// Channel lists for ${codes.length} countries (${codes.join(', ')}).\n` +
    '// Playable channels come from public streams (tested); entries marked "restricted" open the channel\'s own official player/site.\n' +
    '// Generated and merged by scripts/build-channels.js.\n';
  const sorted = {};
  for (const c of codes) sorted[c] = result[c];
  const body = 'window.CHANNELS = {\n' +
    codes.map(c => `${JSON.stringify(c)}: [\n${sorted[c].map(e => JSON.stringify(e)).join(',\n')}\n]`).join(',\n') +
    '\n};\n';
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, header + body);
  log(`Saved to ${outFile}`);
  return sorted;
}

module.exports = { build, selectCandidates, buildCountry, checkStream, readExisting };

if (require.main === module) {
  const args = process.argv.slice(2);
  const refresh = args.includes('--refresh');
  const countries = args.filter(a => !a.startsWith('--')).map(normCountry).filter(Boolean);
  if (!countries.length) {
    console.error('Usage: node scripts/build-channels.js [--refresh] <COUNTRY_CODE> [...]');
    process.exit(1);
  }
  build({ countries, refresh }).catch(err => { console.error('Failed:', err.message); process.exit(1); });
}
