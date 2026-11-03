// Globe - day and night in real time.
// The land and ocean are painted on a canvas (equirectangular map), darkened where the sun is
// below the horizon, and used as the globe's texture. It is refreshed once a minute.
// The country polygons stay on top, transparent, so hover, click and borders work as before.
(function () {
  'use strict';

  const W = 2048, H = 1024;       // texture size
  const NIGHT = 0.4;              // brightness on the dark side (1 = same as day)
  const TWILIGHT = 0.1;           // softness of the edge, as sin(sun height)
  const OCEAN = '#0f3f94';
  const LAND = '#8ec1ff';
  const RAD = Math.PI / 180;

  let canvas = null, ctx = null, base = null, outImg = null, texture = null, timer = null;

  // Where the sun is straight overhead right now (low-precision astronomical formulas).
  function subsolarPoint(date) {
    const d = date.getTime() / 86400000 + 2440587.5 - 2451545.0;   // days since J2000
    const L = (280.46 + 0.9856474 * d) % 360;
    const g = ((357.528 + 0.9856003 * d) % 360) * RAD;
    const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
    const eps = (23.439 - 0.0000004 * d) * RAD;
    const dec = Math.asin(Math.sin(eps) * Math.sin(lambda));
    const ra = Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)) / RAD;
    const gmst = (280.46061837 + 360.98564736629 * d) % 360;
    let lng = (ra - gmst) % 360;
    if (lng > 180) lng -= 360;
    if (lng < -180) lng += 360;
    return { lat: dec / RAD, lng: lng };
  }

  function drawBase(features) {
    canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.fillStyle = OCEAN;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = LAND;
    for (const f of features) {
      const g = f.geometry;
      if (!g) continue;
      const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
      ctx.beginPath();
      for (const poly of polys) {
        for (const ring of poly) {
          ring.forEach(function (p, i) {
            const x = (p[0] + 180) / 360 * W;
            const y = (90 - p[1]) / 180 * H;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          });
          ctx.closePath();
        }
      }
      ctx.fill('evenodd');
    }
    base = new Uint8ClampedArray(ctx.getImageData(0, 0, W, H).data);
    outImg = ctx.createImageData(W, H);
  }

  // Darken the night side for the given moment.
  function shade(date) {
    const sun = subsolarPoint(date);
    const sd = Math.sin(sun.lat * RAD), cd = Math.cos(sun.lat * RAD);
    const colCos = new Float32Array(W);
    for (let x = 0; x < W; x++) colCos[x] = Math.cos(((x + 0.5) / W * 360 - 180 - sun.lng) * RAD);
    const out = outImg.data;
    for (let y = 0; y < H; y++) {
      const lat = (90 - (y + 0.5) / H * 180) * RAD;
      const sl = Math.sin(lat) * sd, cl = Math.cos(lat) * cd;
      let i = y * W * 4;
      for (let x = 0; x < W; x++, i += 4) {
        let f = (sl + cl * colCos[x] + TWILIGHT) / (2 * TWILIGHT);
        f = f < 0 ? 0 : f > 1 ? 1 : f;
        f = f * f * (3 - 2 * f);
        const k = NIGHT + (1 - NIGHT) * f;
        out[i] = base[i] * k * (0.8 + 0.2 * f);       // a little blue at night
        out[i + 1] = base[i + 1] * k * (0.9 + 0.1 * f);
        out[i + 2] = base[i + 2] * k;
        out[i + 3] = 255;
      }
    }
    ctx.putImageData(outImg, 0, 0);
  }

  function refresh() {
    if (document.hidden) return;
    shade(new Date());
    if (texture) {
      texture.image = canvas;
      texture.needsUpdate = true;
    }
  }

  // The first picture goes in through the normal image URL; later minutes just redraw the same canvas.
  function install() {
    const mat = globe.globeMaterial();
    globe.globeImageUrl(canvas.toDataURL('image/png'));
    let tries = 0;
    const wait = setInterval(function () {
      if (mat.map || ++tries > 100) {
        clearInterval(wait);
        if (!mat.map) return;               // texture never arrived: keep the plain globe
        texture = mat.map;
        if (mat.color) mat.color.set('#ffffff');   // the texture carries the colors now
        if (typeof onDayNightReady === 'function') onDayNightReady();
        timer = setInterval(refresh, 60000);
        document.addEventListener('visibilitychange', refresh);
      }
    }, 50);
  }

  window.startDayNight = function (features) {
    try {
      drawBase(features);
      shade(new Date());
      install();
    } catch (e) {
      console.error('Day/night layer disabled:', e);
    }
  };
})();
