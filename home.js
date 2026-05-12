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


  /* ── LOADER + PASSWORD GATE ─────────────────────────────────
     Two modes:
       1. If sessionStorage flag set (already unlocked this tab)
          or no password configured → behave like the original
          loader (auto-fade after 600 ms / window load).
       2. Otherwise show the password form, keep the loader in
          place until the correct password is entered. Hash
          (SHA-256 hex) is compared client-side. This is a
          polite barrier, not real security — anyone determined
          can bypass via DevTools. Good enough to block search
          engines and casual browsing.

     To set/change the password locally: paste this in a browser
     console, then replace PASSWORD_HASH below with the result.
       crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR_PASSWORD'))
         .then(b => console.log([...new Uint8Array(b)]
           .map(x => x.toString(16).padStart(2,'0')).join(''))); */
  (function loaderAndGate() {
    var el = document.getElementById('loader');
    if (!el) return;

    var SESSION_KEY = 'nk_unlocked';
    // Tracks whether the loader animation has already played in
    // this tab. Once it has, subsequent navigations back to the
    // homepage (from a case page, for example) skip straight to
    // the content instead of replaying the wordmark + bar.
    var LOADER_SHOWN_KEY = 'nk_loader_shown';
    // SHA-256 hex of the gate password. Empty string = no gate.
    // Current password: "portfolio26"
    var PASSWORD_HASH = '28f0ee33f463deb755ce881ff9987ab2e6cf13844f03246eaf775680d2ca0f92';

    function fadeOut(delay) {
      setTimeout(function () { el.classList.add('is-done'); }, delay || 0);
    }

    function markLoaderShown() {
      try { sessionStorage.setItem(LOADER_SHOWN_KEY, 'true'); } catch (_) {}
    }

    function runStandardLoader() {
      // If we've already played the loader in this tab session,
      // skip the animation entirely so internal navigation feels
      // instant.
      if (sessionStorage.getItem(LOADER_SHOWN_KEY) === 'true') {
        el.classList.add('is-done');
        return;
      }
      markLoaderShown();
      if (reduceMotion) { el.classList.add('is-done'); return; }
      window.addEventListener('load', function () { fadeOut(600); });
      fadeOut(1400);
    }

    var alreadyUnlocked = sessionStorage.getItem(SESSION_KEY) === 'true';
    var gateForm = document.getElementById('password-gate');

    // No password configured, no form, or already unlocked → skip gate
    if (!PASSWORD_HASH || !gateForm || alreadyUnlocked) {
      runStandardLoader();
      return;
    }

    // Show the gate, suppress the auto progress bar
    el.classList.add('is-locked');
    gateForm.hidden = false;
    var input = document.getElementById('password-input');
    var error = document.getElementById('password-error');
    if (input) input.focus();

    function sha256hex(text) {
      var data = new TextEncoder().encode(text);
      return crypto.subtle.digest('SHA-256', data).then(function (buf) {
        return Array.from(new Uint8Array(buf)).map(function (b) {
          return b.toString(16).padStart(2, '0');
        }).join('');
      });
    }

    gateForm.addEventListener('submit', function (e) {
      e.preventDefault();
      sha256hex(input.value).then(function (hash) {
        if (hash === PASSWORD_HASH) {
          sessionStorage.setItem(SESSION_KEY, 'true');
          markLoaderShown();
          gateForm.hidden = true;
          // Instantly hide the loader — no fade, no flash of the
          // progress bar reappearing after .is-locked is removed.
          // Reuses the pre-paint skip class which applies
          // display:none on the loader.
          document.documentElement.classList.add('loader-skip');
        } else {
          if (error) error.hidden = false;
          input.value = '';
          input.focus();
        }
      });
    });
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


  /* ── SCROLL SPY (active nav link) ───────────────────────────
     Tracks which top-level homepage section is currently in
     view and toggles `.is-active` on the matching topbar link
     (and `.active` on the mobile menu link). Uses scrollY +
     an offset roughly matching the floating topbar height, so
     a section is considered "active" once its top edge crosses
     under the pill. Falls back to the last section when the
     page is scrolled to the very bottom — otherwise the final
     section can never reach the offset on tall viewports. */
  (function scrollSpy() {
    var ids = ['home', 'work', 'playground', 'approach', 'about', 'contact'];
    var sections = ids
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);
    if (!sections.length) return;

    var topLinks = document.querySelectorAll('.topbar-link');
    var mobileLinks = document.querySelectorAll('.mobile-menu-links a');
    var offset = 140;

    function setActive(id) {
      topLinks.forEach(function (link) {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
      });
      mobileLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
      });
    }

    function onScroll() {
      var y = window.scrollY + offset;
      var currentId = sections[0].id;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= y) currentId = sections[i].id;
      }
      var atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) currentId = sections[sections.length - 1].id;
      setActive(currentId);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  })();


  /* ── CASE CARD GIF RESET ───────────────────────────────────
     The hover GIFs are layered over their static counterparts
     and crossfade via opacity. Without intervention, the GIF
     keeps playing while invisible, so the next hover catches
     it mid-loop. We force a restart from frame 1 on every
     mouseleave by clearing the src and putting it back on the
     next mouseenter. The originating src is cached in a data
     attribute the first time we see the image. */
  (function caseCardGifReset() {
    var gifs = document.querySelectorAll('.case-card-img-hover');
    if (!gifs.length) return;
    gifs.forEach(function (img) {
      img.dataset.gifSrc = img.getAttribute('src');
      var card = img.closest('.case-card');
      if (!card) return;
      card.addEventListener('mouseenter', function () {
        // Only re-set if it was cleared — avoids a fresh
        // network fetch every time the pointer wiggles.
        if (!img.getAttribute('src')) {
          img.setAttribute('src', img.dataset.gifSrc);
        }
      });
      card.addEventListener('mouseleave', function () {
        img.setAttribute('src', '');
      });
    });
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
