# Globe

A static web page with a rotating blue 3D globe. Pick a country to see the official local time of its capital and its TV channels, and watch them right in the page.

Hobby project: no ads, no tracking, nothing hosted by the author.

## Features

- Rotating 3D globe (globe.gl / three.js) with automatic zoom to the selected country
- Official time and date of the capital (IANA time zones)
- Channel list per country, with search, favorites (with flags) and history
- Public streams play directly (hls.js)
- Commercial channels open their own official player inside the page (or a link if the site refuses framing)
- Automatic interface language from the browser: English, German, Romanian, French, Spanish (English fallback)
- Country search, "my country" shortcut and previous/next channel buttons
- "Send to TV" button: AirPlay (Safari) and Chromecast (Chrome), for directly played channels
- Info page explaining how channels are handled

Currently 21 countries have channels: RO, DE, IT, GB, PL, UA, FR, US, HU, SK, RS, ES, AT, GR, BG, MD, HR, LV, LT, MX, CA. Other countries show an "under construction" message.

## Run locally

No build step. Serve the folder with any static server:

```
npx serve .
```

Then open the printed address. Opening `index.html` directly from disk will not work in most browsers.

## Deploy

Works on GitHub Pages as-is (Settings > Pages > deploy from branch `main`, folder `/ (root)`).

## Project layout

- `index.html`, `info.html` - the two pages
- `js/` - globe, panel, favorites/history, translations logic
- `i18n/` - interface texts (en, de, ro)
- `data/channels.js` - channel lists; `data/timezones.js` - country time zones
- `scripts/` - channel list builder

## Updating channels

Channel data comes from the public [iptv-org](https://github.com/iptv-org) API. Requires Node 18+.

```
node scripts/build-channels.js CZ            # add a new country
node scripts/build-channels.js --refresh RO  # re-test a country already in the file
```

The script keeps only https HLS streams that answer right now and allow browser access (CORS), then merges them into `data/channels.js`. Existing countries are not touched unless `--refresh` is used; hand-curated "official" entries are preserved. The filtering policy lives in `scripts/channel-rules.js`:

- commercial, shopping and FAST-platform channels are never restreamed
- token/login streams are skipped
- state propaganda outlets are excluded
- public, government and community broadcasters are listed first

## Legal note

This project does not host, store or restream any video. Public streams are linked from openly available lists; commercial channels are shown only through their own official websites. Streams can stop working at any time.

## Removal requests

If you own a channel or stream listed here and want it removed, [open an issue](../../issues) with the channel name and country, and it will be removed promptly.

## Credits and dedication

Built by Virgil C, in memory of Mr. I. Roth, my neighbour.

Uses [globe.gl](https://globe.gl), [hls.js](https://github.com/video-dev/hls.js), Natural Earth country shapes and [iptv-org](https://github.com/iptv-org) data.

## License

[MIT](LICENSE)
