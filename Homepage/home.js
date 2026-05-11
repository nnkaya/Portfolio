/* ============================================================
   HOME PAGE — Nur Kaya Portfolio  (v5)
   - Loader fade-out
   - Topbar scroll detection (frosted on scroll)
   - Cursor spotlight on cards (Detail 5)
   - Custom "VIEW →" cursor (Detail 8)
   ============================================================ */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;


  /* ── LOADER ─────────────────────────────────────────────────
     Fades out shortly after window 'load'. Fallback timer
     covers the case where 'load' has already fired. */
  (function loader() {
    var el = document.getElementById('loader');
    if (!el) return;
    if (reduceMotion) {
      el.classList.add('is-done');
      return;
    }
    window.addEventListener('load', function () {
      setTimeout(function () { el.classList.add('is-done'); }, 600);
    });
    setTimeout(function () { el.classList.add('is-done'); }, 1400);
  })();


  /* ── HEADER SCROLL ──────────────────────────────────────────
     Adds .is-scrolled to the floating topbar after the user
     scrolls past a small threshold so the pill picks up the
     frosted glass style. */
  (function headerScroll() {
    var bar = document.getElementById('topbar');
    if (!bar) return;
    var threshold = 24;
    function update() {
      if (window.scrollY > threshold) bar.classList.add('is-scrolled');
      else bar.classList.remove('is-scrolled');
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  })();


  /* ── CURSOR SPOTLIGHT (per-card) ──────────────────────────
     Stronger radial glow on each .case-card on hover. */
  (function spotlight() {
    if (isTouch || reduceMotion) return;
    var cards = document.querySelectorAll('.case-card');
    cards.forEach(function (card) {
      function setPos(e) {
        var rect = card.getBoundingClientRect();
        var x = ((e.clientX - rect.left) / rect.width) * 100;
        var y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      }
      card.addEventListener('mouseenter', setPos);
      card.addEventListener('mousemove', setPos);
    });
  })();


  /* ── CUSTOM CURSOR ─────────────────────────────────────────
     "View →" pill follows the mouse only while hovering a
     case card. Hidden everywhere else.

     We don't rely on mouseenter/mouseleave per card — those
     can race when moving between adjacent cards or briefly
     across child elements. Instead we re-evaluate on every
     mousemove AND on scroll (using the last known pointer
     position) by asking the document what's under the pointer
     — robust against fast card-to-card movement, DOM child
     traversal, and scroll changing what's under a stationary
     mouse. */
  (function customCursor() {
    if (isTouch || reduceMotion) return;
    var cursor = document.querySelector('.custom-cursor');
    if (!cursor) return;
    if (!document.querySelectorAll('.case-card').length) return;

    var x = 0, y = 0;
    var rendered = { x: 0, y: 0 };
    var rafId = null;
    var initialised = false;
    var inCard = false;

    function render() {
      rendered.x += (x - rendered.x) * 0.22;
      rendered.y += (y - rendered.y) * 0.22;
      cursor.style.setProperty('--cursor-x', rendered.x + 'px');
      cursor.style.setProperty('--cursor-y', rendered.y + 'px');
      rafId = requestAnimationFrame(render);
    }

    function updateViewState() {
      // Use last known pointer position to find what's under it.
      // Works for both mousemove (event has new x/y) and scroll
      // (event doesn't, so we reuse cached x/y).
      if (!initialised) return;
      var el = document.elementFromPoint(x, y);
      var card = el && el.closest && el.closest('.case-card');
      var shouldShowView = !!card;
      if (shouldShowView !== inCard) {
        inCard = shouldShowView;
        if (inCard) {
          cursor.classList.add('is-view');
          document.body.classList.add('cursor-active');
        } else {
          cursor.classList.remove('is-view');
          document.body.classList.remove('cursor-active');
        }
      }
    }

    document.addEventListener('mousemove', function (e) {
      x = e.clientX;
      y = e.clientY;
      if (!initialised) {
        rendered.x = x;
        rendered.y = y;
        initialised = true;
      }
      if (!rafId) render();
      updateViewState();
    });

    // Scroll re-evaluates view state without moving the cursor:
    // the pill should appear/disappear as a card scrolls under
    // a stationary pointer.
    window.addEventListener('scroll', updateViewState, { passive: true });

    document.addEventListener('mouseleave', function () {
      inCard = false;
      cursor.classList.remove('is-view');
      document.body.classList.remove('cursor-active');
    });
  })();

})();
