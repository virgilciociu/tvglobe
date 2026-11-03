// Globe - channel filtering policy (shared by build-channels.js).
// Only free, public streams are played directly. Commercial channels are never
// restreamed; they are listed as "official" entries that open the channel's own site.

// Builds a word-boundary regex from an alternation string.
const L = s => new RegExp('(?<![a-z0-9])(' + s + ')(?![a-z])', 'i');

// Commercial / FAST / shopping brands: never played from a third-party stream.
const COMMERCIAL = L(
  'shop|shopping|qvc|hse|pluto|samsung|netflix|prime|cnn|bloomberg|discovery|warner|' +
  'paramount|nick|disney|mtv|comedy central|cartoon|boomerang|eurosport|dazn|sky|a&e|' +
  'history|tlc|fashion|hbo|axn|fox|nat ?geo|national geographic|vh1|bbc|eleven|viasat|' +
  'curiosity|terra mater|filmbox|minimax|jim jam'
);

// State propaganda outlets are excluded entirely.
const EXCLUDE = L(
  'rt|russia today|sputnik|rossiya|perviy|ren ?tv|zvezda|rtr|cgtn|ntd|tass|tvc|ntv'
);

// Stream URLs that need tokens, logins, or come from FAST platforms / CDNs we do not trust.
const BAD_URL = new RegExp(
  [
    'antenaplay\\.ro', 'vip-acasatv', 'xykt-fix\\.github\\.io',
    'token=', 'hdnts=', 'wmsAuthSign', '[?&](sign|auth|key|e|h)=', '\\.php\\?', 'login',
    'amagi', 'pluto\\.tv', 'plex\\.tv', 'samsung', 'tubi', 'stirr', 'xumo', 'wurl',
    'rakuten', 'vizio', 'roku', 'frequency\\.(com|stream)', 'distro', 'haystack', 'jmp2',
    'antik\\.sk', 'mediatailor', 'sofast\\.tv', 'cdn\\.tv1\\.eu',
    '(raw|gist)\\.githubusercontent\\.com', 'd3k8wzt41aflvx\\.cloudfront\\.net',
    'klowdtv', 'uplynk', 'zype', 'getpublica', 'ottera'
  ].join('|'),
  'i'
);

// Names of public / government / community broadcasters are listed first.
const PUBLIC_PRIORITY = L(
  'tvr|trt|rai|zdf|ard|orf|rts|hrt|bnt|ert|tve|rtve|france ?[2-5]|arte|tvp|tvc|lrt|ltv|' +
  'trm|moldova|parlament|senat|camera|parliament|government|community|public|rtl ?(lux)?|' +
  'dw|deutsche welle|euronews|nasa|pbs|c-span'
);

const DEFAULT_CAP = 60;
// Per-country limits (number of directly playable channels kept).
const CAPS = { US: 100, RO: 92, DE: 76, IT: 86, GB: 78, FR: 62, PL: 50, CA: 50, HU: 49, ES: 43 };

// iptv-org uses "UK"; the map uses ISO "GB".
const COUNTRY_ALIASES = { UK: 'GB' };

module.exports = { L, COMMERCIAL, EXCLUDE, BAD_URL, PUBLIC_PRIORITY, DEFAULT_CAP, CAPS, COUNTRY_ALIASES };
