/* MedicineBank · Media Sector — site behaviour
   Vanilla JS, no dependencies. Works from plain static hosting (GitHub Pages).
   Requires js/data.js (ART, HERO_SLIDES, MEDIA_ITEMS, ROWS, GALLERY_ITEMS). */


/* ── Shared logo (inlined data URI; works without binary assets) ── */
if (typeof LOGO !== 'undefined') {
  document.querySelectorAll('img[src*="IMG_8013.png"]').forEach(function (img) { img.src = LOGO; });
}

/* ── YouTube thumbnails ──────────────────────────────────────────
   Any item in data.js may carry `youtube:` (link or bare ID). Cards,
   gallery tiles, hero slides and search hits then render the video
   thumbnail with all the existing effects (scrim, grain, hover, snap).
   Fallback chain if a thumbnail fails: maxres -> hq -> item's `img`. */
function youtubeId(u) {
  if (!u) return null;
  var s = String(u).trim();
  var m = s.match(/(?:youtube\.com\/(?:watch\?[^#]*v=|shorts\/|embed\/|v\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (m) return m[1];
  return /^[A-Za-z0-9_-]{11}$/.test(s) ? s : null;
}
function itemImg(m, alt) {
  var a = typeof alt === 'string' ? alt : (m.title || '');
  var yid = youtubeId(m.youtube);
  if (!yid) return '<img src="' + m.img + '" alt="' + a + '" loading="lazy"/>';
  return '<img src="https://i.ytimg.com/vi/' + yid + '/maxresdefault.jpg" alt="' + a + '" loading="lazy"' +
    ' data-yt-id="' + yid + '" data-yt-step="0" data-yt-fallback="' + m.img + '"/>';
}
document.addEventListener('error', function (e) {
  var t = e.target;
  if (!t || t.tagName !== 'IMG' || !t.dataset || !t.dataset.ytId) return;
  if (t.dataset.ytStep === '0') {
    t.dataset.ytStep = '1';
    t.src = 'https://i.ytimg.com/vi/' + t.dataset.ytId + '/hqdefault.jpg';
  } else {
    delete t.dataset.ytId;
    if (t.dataset.ytFallback) t.src = t.dataset.ytFallback;
  }
}, true);

/* ── Rendering ─────────────────────────────────────────────────── */

function renderHero() {
  var root = document.querySelector('.hero-carousel');
  if (!root || typeof HERO_SLIDES === 'undefined') return;
  var slides = HERO_SLIDES.map(function (s, i) {
    return '<div class="hero-slide' + (i === 0 ? ' active' : '') + '">' +
      itemImg(s, '') +
      '<div class="hero-caption">' +
        '<span class="hero-eyebrow">' + s.eyebrow + '</span>' +
        '<h1 class="hero-title">' + s.title + '</h1>' +
        '<p class="hero-dek">' + s.dek + '</p>' +
        '<div class="hero-actions">' +
          '<button class="hero-btn primary" type="button"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' + s.cta + '</button>' +
          '<button class="hero-btn ghost" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>More info</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');
  root.insertAdjacentHTML('afterbegin', slides);
}

function cardHTML(m) {
  return '<div class="media-card" data-kind="' + m.kind + '">' + itemImg(m) +
    '<div class="card-scrim"></div>' +
    '<div class="card-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>' +
    '<div class="card-meta"><p class="card-kind">' + m.kind + '</p><p class="card-title">' + m.title + '</p><p class="card-sub">' + m.sub + '</p></div></div>';
}

function renderRows() {
  if (typeof ROWS === 'undefined') return;
  document.querySelectorAll('.row-scroller[data-row]').forEach(function (el) {
    var ids = ROWS[el.dataset.row] || [];
    el.innerHTML = ids.map(function (i) { return cardHTML(MEDIA_ITEMS[i - 1]); }).join('');
  });
}

function galleryItemHTML(g) {
  return '<div class="gallery-item">' + itemImg(g) +
    '<div class="g-scrim"></div><div class="g-meta"><p class="g-title">' + g.title + '</p><p class="g-sub">' + g.sub + '</p></div></div>';
}

function renderGalleries() {
  if (typeof GALLERY_ITEMS === 'undefined') return;
  var home = document.getElementById('homeGallery');
  if (home) home.innerHTML = [0, 2, 4, 1, 5, 3].map(function (i) { return galleryItemHTML(GALLERY_ITEMS[i]); }).join('');
  var full = document.getElementById('fullGallery');
  if (full) full.innerHTML = GALLERY_ITEMS.map(galleryItemHTML).join('');
}

renderHero();
renderRows();
renderGalleries();

/* ── Theme ─────────────────────────────────────────────────────── */
function applyTheme(name) {
  document.body.classList.toggle('theme-dark', name === 'theme-dark');
  document.body.classList.toggle('theme-light', name !== 'theme-dark');
  document.querySelectorAll('.theme-pill').forEach(p =>
    p.classList.toggle('active', p.dataset.theme === name));
  try { localStorage.setItem('mb_theme', name); } catch (e) {}
}
(function initTheme() {
  var saved = null;
  try { saved = localStorage.getItem('mb_theme'); } catch (e) {}
  applyTheme(saved === 'theme-dark' ? 'theme-dark' : 'theme-light');
})();
document.querySelectorAll('.theme-pill').forEach(p =>
  p.addEventListener('click', () => applyTheme(p.dataset.theme)));

/* ── Burger menu ───────────────────────────────────────────────── */
(function burger() {
  var btn = document.getElementById('burgerBtn');
  var menu = document.getElementById('burgerMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', function () {
    var open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    document.body.classList.toggle('menu-open', open);
    if (open) closeSearch();
  });
})();

/* ── Search overlay (client-side over the media catalogue) ────── */
var searchOverlay = document.getElementById('searchOverlay');
var searchInput = document.getElementById('searchInput');
var searchResults = document.getElementById('searchResults');

function closeSearch() {
  if (!searchOverlay) return;
  searchOverlay.classList.remove('open');
  var btn = document.getElementById('searchBtn');
  if (btn) btn.setAttribute('aria-expanded', 'false');
}
(function search() {
  var btn = document.getElementById('searchBtn');
  var closeBtn = document.getElementById('searchCloseBtn');
  if (!btn || !searchOverlay) return;
  btn.addEventListener('click', function () {
    var open = searchOverlay.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
    if (open && searchInput) searchInput.focus();
  });
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSearch(); });
  if (searchInput) searchInput.addEventListener('input', renderSearch);
})();
function renderSearch() {
  var q = searchInput.value.trim().toLowerCase();
  if (!q) {
    searchResults.innerHTML = '<div class="search-empty">Start typing to search the Media library.</div>';
    return;
  }
  var hits = MEDIA_ITEMS.filter(m =>
    (m.kind + ' ' + m.title + ' ' + m.sub).toLowerCase().includes(q));
  searchResults.innerHTML = hits.length
    ? hits.map(m =>
        '<a class="search-hit" href="#">' + itemImg(m, '') +
        '<span><span class="hit-kind">' + m.kind + '</span>' +
        '<div class="hit-title">' + m.title + '</div>' +
        '<div class="hit-sub">' + m.sub + '</div></span></a>').join('')
    : '<div class="search-empty">Nothing found for &ldquo;' + q + '&rdquo;.</div>';
}

/* ── Bloom field background (same "Pipo" animation as the main site) ── */
(function bloom() {
  var el = document.getElementById('bloomBg');
  if (!el) return;
  var GRAIN = "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.305'/></svg>\")";
  var BLOBS = [
    { x: 68.1,  y: 46.03, r: 41.1,  rgb: '230,176,147', p: 0, p2: 0 },
    { x: 25.17, y: 75.99, r: 44.6,  rgb: '163,206,255', p: 0, p2: 0 },
    { x: 53.11, y: 12.71, r: 66.65, rgb: '250,249,239', p: 0, p2: 0 }
  ];
  var STOPS = [[0, 1], [0.25, 0.844], [0.5, 0.5], [0.75, 0.156], [1, 0]];
  function hashPhase(n) { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return (s - Math.floor(s)) * Math.PI * 2; }
  BLOBS.forEach(function (b, i) { b.p = hashPhase(i + 1); b.p2 = hashPhase(i + 101); });
  var SPEED = 0.86, AMT = 0.72, DIR = 1;
  function layer(b, ph) {
    var x = b.x + (Math.sin(ph * 0.55 + b.p) - Math.sin(b.p)) * 14 * AMT;
    var y = b.y + (Math.sin(ph * 0.43 + b.p2) - Math.sin(b.p2)) * 14 * AMT;
    var parts = STOPS.map(function (s) { return 'rgba(' + b.rgb + ',' + s[1] + ') ' + (s[0] * b.r) + '%'; });
    return 'radial-gradient(circle at ' + x + '% ' + y + '%, ' + parts.join(', ') + ')';
  }
  function render(t) {
    var spin = t * SPEED * DIR;
    el.style.backgroundImage = GRAIN + ', ' + BLOBS.map(function (b) { return layer(b, spin); }).join(', ');
  }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  render(0);
  if (reduce) return;
  var start = null;
  function frame(now) {
    if (start === null) start = now;
    render((now - start) / 1000);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

/* ── Hero carousel (crossfade) ─────────────────────────────────── */
(function hero() {
  var root = document.querySelector('.hero-carousel');
  if (!root) return;
  var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
  if (!slides.length) return;
  var dotsBox = root.querySelector('.hero-dots');
  var idx = 0, timer = null;
  if (dotsBox) slides.forEach(function (_, i) {
    var d = document.createElement('button');
    d.className = 'hero-dot' + (i === 0 ? ' active' : '');
    d.type = 'button';
    d.setAttribute('aria-label', 'Slide ' + (i + 1));
    d.addEventListener('click', function () { go(i); restart(); });
    dotsBox.appendChild(d);
  });
  var dots = dotsBox ? Array.prototype.slice.call(dotsBox.children) : [];
  function go(n) {
    idx = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) { s.classList.toggle('active', i === idx); });
    dots.forEach(function (d, i) { d.classList.toggle('active', i === idx); });
  }
  function restart() { clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 6500); }
  var prev = root.querySelector('.hero-nav.prev');
  var next = root.querySelector('.hero-nav.next');
  if (prev) prev.addEventListener('click', function () { go(idx - 1); restart(); });
  if (next) next.addEventListener('click', function () { go(idx + 1); restart(); });
  root.addEventListener('mouseenter', function () { clearInterval(timer); });
  root.addEventListener('mouseleave', restart);
  go(0); restart();
})();

/* ── Row carousels (edge buttons) ──────────────────────────────── */
document.querySelectorAll('.row-wrap').forEach(function (wrap) {
  var scroller = wrap.querySelector('.row-scroller');
  if (!scroller) return;
  var step = function () { return Math.max(260, scroller.clientWidth * 0.8); };
  var prev = wrap.querySelector('.row-btn.prev');
  var next = wrap.querySelector('.row-btn.next');
  if (prev) prev.addEventListener('click', function () { scroller.scrollBy({ left: -step(), behavior: 'smooth' }); });
  if (next) next.addEventListener('click', function () { scroller.scrollBy({ left: step(), behavior: 'smooth' }); });
});

/* ── Reveal on scroll ──────────────────────────────────────────── */
(function reveal() {
  var els = document.querySelectorAll('.media-card, .gallery-item, .fade-up');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(function (el) { io.observe(el); });
})();
