// Globe - the night sky: twinkling stars, shooting stars and a sky that gets slightly darker at night.
// It is a canvas behind the globe. "Night" follows the local time of the selected country
// (or the phone's own time when no country is selected).
(function () {
  'use strict';

  const canvas = document.getElementById('sky');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPhone = () => window.innerWidth <= 700;

  const SKY_TINT = '2,10,42';        // how the sky darkens
  const SKY_MAX = 0.3;               // darkest the sky gets (0 = no change)
  const TINTS = ['255,255,255', '200,225,255', '255,244,205'];

  let W = 0, H = 0, dpr = 1;
  let stars = [];
  let comets = [];
  let nightNow = 0, nightTarget = 0;
  let nextComet = 3000;
  let last = 0;
  let timer = null;

  // --- night level from local time ----------------------------------------
  const formatters = {};
  function localHour(tz) {
    try {
      const key = tz || 'local';
      const f = formatters[key] || (formatters[key] = new Intl.DateTimeFormat('en-GB', {
        hour: 'numeric', minute: 'numeric', hourCycle: 'h23', timeZone: tz || undefined
      }));
      const parts = f.formatToParts(new Date());
      const h = +parts.find(p => p.type === 'hour').value;
      const m = +parts.find(p => p.type === 'minute').value;
      return h + m / 60;
    } catch (e) {
      const d = new Date();
      return d.getHours() + d.getMinutes() / 60;
    }
  }
  const smooth = x => x * x * (3 - 2 * x);
  function nightness(h) {            // 0 = full day, 1 = full night
    if (h >= 20 || h < 5) return 1;
    if (h >= 7 && h < 18) return 0;
    if (h >= 18) return smooth((h - 18) / 2);
    return 1 - smooth((h - 5) / 2);
  }
  function updateTarget() {
    const tz = typeof currentTimeZone !== 'undefined' ? currentTimeZone : null;
    nightTarget = nightness(localHour(tz));
  }

  // --- stars ---------------------------------------------------------------
  function makeStars() {
    const count = isPhone() ? 30 : 40;
    const minDim = Math.min(W, H);
    stars = [];
    let guard = 0;
    while (stars.length < count && guard++ < 2000) {
      const x = Math.random(), y = Math.random();
      // keep most stars off the middle of the screen, where the globe is
      const dx = x * W - W / 2, dy = y * H - H / 2;
      if (Math.hypot(dx, dy) < minDim * 0.3) continue;
      stars.push({
        x: x, y: y,
        r: 1.5 + Math.random() * 2,                       // radius 1.5-3.5 px (3-7 px wide)
        tint: TINTS[Math.floor(Math.random() * TINTS.length)],
        speed: 0.0012 + Math.random() * 0.0018,           // one pulse every 2-5 s
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function drawStar(s, t, night) {
    const tw = reduced ? 0.85 : 0.55 + 0.45 * Math.sin(t * s.speed * 2 * Math.PI + s.phase) * 0.5 + 0.225;
    const a = (0.4 + 0.6 * night) * tw;
    const x = s.x * W, y = s.y * H, r = s.r;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    g.addColorStop(0, 'rgba(' + s.tint + ',' + a.toFixed(3) + ')');
    g.addColorStop(0.25, 'rgba(' + s.tint + ',' + (a * 0.45).toFixed(3) + ')');
    g.addColorStop(1, 'rgba(' + s.tint + ',0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,' + Math.min(1, a + 0.15).toFixed(3) + ')';
    ctx.beginPath();
    ctx.arc(x, y, r * 0.75, 0, Math.PI * 2);
    ctx.fill();
    if (r > 2.6) {                                          // the biggest ones get a cross sparkle
      const len = r * 4.5;
      ctx.strokeStyle = 'rgba(' + s.tint + ',' + (a * 0.7).toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - len, y); ctx.lineTo(x + len, y);
      ctx.moveTo(x, y - len); ctx.lineTo(x, y + len);
      ctx.stroke();
    }
  }

  // --- shooting stars ------------------------------------------------------
  function spawnComet() {
    const fromLeft = Math.random() < 0.5;
    const angle = (20 + Math.random() * 30) * Math.PI / 180;       // 20-50 degrees below horizontal
    const dir = fromLeft ? 1 : -1;
    comets.push({
      x: fromLeft ? -50 : W + 50,
      y: Math.random() * H * 0.55,
      vx: Math.cos(angle) * dir * (650 + Math.random() * 300),
      vy: Math.sin(angle) * (650 + Math.random() * 300),
      len: 140 + Math.random() * 90
    });
  }

  function drawComet(c) {
    const sp = Math.hypot(c.vx, c.vy);
    const tx = c.x - c.vx / sp * c.len, ty = c.y - c.vy / sp * c.len;
    const g = ctx.createLinearGradient(c.x, c.y, tx, ty);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.25, 'rgba(190,220,255,0.55)');
    g.addColorStop(1, 'rgba(160,200,255,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(c.x, c.y);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    const h = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 9);
    h.addColorStop(0, 'rgba(255,255,255,0.95)');
    h.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = h;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 9, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- main loop -----------------------------------------------------------
  function paused() {
    return document.hidden || document.body.classList.contains('theater');
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    makeStars();
  }

  function frame(now) {
    timer = null;
    if (paused()) { timer = setTimeout(function () { last = 0; schedule(); }, 500); return; }
    const dt = last ? Math.min(now - last, 100) : 16;
    last = now;

    nightNow += (nightTarget - nightNow) * Math.min(1, dt / 1500);       // slow fade between day and night
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(' + SKY_TINT + ',' + (nightNow * SKY_MAX).toFixed(3) + ')';
    ctx.fillRect(0, 0, W, H);

    for (const s of stars) drawStar(s, now, nightNow);

    if (!reduced) {
      nextComet -= dt;
      if (nextComet <= 0 && comets.length < 2) {
        spawnComet();
        nextComet = 6000 + Math.random() * 4000;                          // one every 6-10 s
      }
      comets = comets.filter(function (c) {
        c.x += c.vx * dt / 1000;
        c.y += c.vy * dt / 1000;
        drawComet(c);
        return c.x > -300 && c.x < W + 300 && c.y < H + 300;
      });
    }
    schedule(reduced ? 1000 : 0);
  }

  function schedule(delay) {
    if (timer) return;
    if (delay) timer = setTimeout(function () { timer = null; requestAnimationFrame(frame); }, delay);
    else requestAnimationFrame(frame);
  }

  resize();
  updateTarget();
  nightNow = nightTarget;
  window.addEventListener('resize', resize);
  setInterval(updateTarget, 1000);
  document.addEventListener('visibilitychange', function () { last = 0; });
  schedule();
})();
