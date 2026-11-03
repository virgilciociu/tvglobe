Object.assign(window.I18N.en, {
  infoH1: 'About Globe',
  introP1: 'Globe is a rotating 3D globe. Pick a country and watch its TV channels in your browser. Globe does not host, record or copy any TV stream.',

  sec1Title: 'Three ways a channel can open',
  way1Title: 'Played directly in Globe',
  way1Text: 'The channel publishes an open live stream (HLS). Globe plays that public stream in its own player. Examples: the public broadcaster TVR, many local TV stations and music channels.',
  way2Title: 'Official player, shown in Globe',
  way2Text: 'The channel is commercial and its broadcasting rights are paid for (for example Antena 1, Kanal D, Prima News or Voyo Sport). Globe does not take its stream. It shows the channel’s own official website inside a frame (iframe), so the official player, its ads, its terms and any login stay exactly as the channel wants them.',
  way3Title: 'Link only',
  way3Text: 'Some websites refuse to be shown inside another page. In that case the frame stays empty, and the link under it opens the official site.',

  sec2Title: 'Why commercial channels open on their original websites',
  why1: 'TV channels pay for broadcasting rights. Copying their stream and re-broadcasting it from another website, without permission, is unauthorised retransmission, even if the stream is technically easy to reach.',
  why2: 'With an official player the viewer is watching on the channel’s own page. The channel keeps control: its own player, its advertising, its country restrictions and its right to block embedding.',
  why3: 'Globe never bypasses a restriction. If a channel does not want to be shown inside Globe, it can block that (see “Why some channels do not load” below) and Globe respects it.',

  sec3Title: 'Technical details',
  tech1: 'Channel data comes from the public iptv-org lists (channels, streams and blocklist). Channels that are on the blocklist, closed, or adult are left out.',
  tech2: 'Only HTTPS streams in HLS format (.m3u8) are used. Browsers cannot play other formats directly, and an HTTPS page is not allowed to load plain HTTP streams (mixed content).',
  tech3: 'Every stream is tested before it enters the list: the server must answer, return a valid playlist (it must start with #EXTM3U) and allow access from a web page (CORS). Dead streams are removed. The list is a snapshot, so a channel can stop working later.',
  tech4: 'Streams that come from the servers of a commercial platform (for example the Antena Play network), or that contain an access token, are not played by Globe. Those channels are shown as official players instead.',
  tech5: 'Playback uses hls.js (Media Source Extensions). Safari and iPhones play HLS natively. If a stream does not start within 15 seconds, Globe tries a backup address, and if there is none it shows a message.',
  tech6: 'Official players are shown in an iframe with restrictions (sandbox): scripts, forms and pop-ups are allowed so the player works, but the embedded page cannot take over Globe or navigate it away. Autoplay and fullscreen are allowed. Addresses starting with http:// are upgraded to https://.',
  tech7: 'The globe is drawn with WebGL (globe.gl and three.js) from Natural Earth country shapes. The official time uses the browser’s Intl API and the IANA time zone of the country; for countries with several time zones the capital’s zone is used. Flags come from flagcdn.com.',
  tech8: 'The language is taken from the phone or browser settings (English, German, Romanian, French or Spanish; English if yours is not available). You can change it with the selector, and your choice is saved in your browser.',

  sec4Title: 'Why some channels do not load',
  fail1: 'The website sends X-Frame-Options, or a Content-Security-Policy with frame-ancestors, which tells the browser not to show it inside other pages.',
  fail2: 'Geo-blocking: many streams and players only work inside the country of the channel.',
  fail3: 'Paywall or login: paid services such as Voyo Sport need a subscription.',
  fail4: 'Cookie banners, ads or scripts on the official site can block the player until you accept or interact.',
  fail5: 'The stream moved, stopped, or was removed by its owner.',

  sec5Title: 'Privacy',
  privacy1: 'Globe has no accounts, no analytics and no advertising. The only thing it saves in your browser is your language choice.',
  privacy2: 'Your browser contacts third parties directly: the hls.js code library (jsDelivr, only when you play a stream), flags (flagcdn.com), the Google Cast script (gstatic.com, only outside Safari), the channels’ stream servers, and the official websites when you open an official player. Their own cookies and advertising rules apply there.',

  sec6Title: 'Channels in this version',
  channelsIntro: 'Generated from the current channel list.',
  countryLine: '{country}: {direct} played directly, {official} official players',
  officialNames: 'Official players:',

  dedication: 'This website was built by Virgil C and is in memory of Mr. I. Roth, my neighbour.'
});
