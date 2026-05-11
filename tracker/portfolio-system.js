/* ================================================================
   PORTFOLIO SYSTEM — shared behavior
   Mobile menu toggle, used by all case study pages.
   Include this BEFORE per-case JS files.
   ================================================================ */

// Mobile menu toggle (shared across all cases)
(function() {
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  var backdrop = menu.querySelector('.mobile-menu-backdrop');
  var closeBtn = menu.querySelector('.mobile-menu-close');
  var links = menu.querySelectorAll('.mobile-menu-links a');

  function open() {
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }
  function close() {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  toggle.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);
  links.forEach(function(a) { a.addEventListener('click', close); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
  });
})();

// Scroll reveal — shared across all pages.
// Reveals [data-reveal] and [data-reveal-stagger] elements as they enter
// the viewport. With reduced motion, everything is shown immediately.
(function() {
  if (typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(function(el) {
      el.classList.add('is-visible');
    });
    return;
  }
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(function(el) {
      el.classList.add('is-visible');
    });
    return;
  }
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });
  document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach(function(el) {
    io.observe(el);
  });
})();


/* ── SCROLL-UP BUTTON ───────────────────────────────────────────
   Reveals the floating scroll-up button once the user has
   scrolled past one viewport. Clicking it smooth-scrolls back
   to the top. No-op on pages without the button. */
(function scrollUpButton() {
  var btn = document.querySelector('.scroll-up');
  if (!btn) return;

  function update() {
    if (window.scrollY > window.innerHeight) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ── TOPBAR SCROLL STATE ────────────────────────────────────────
   Adds .is-scrolled to the topbar once the user has scrolled
   even a small amount, so the pill picks up its frosted blur. */
(function topbarScroll() {
  var bar = document.getElementById('topbar') || document.querySelector('.topbar');
  if (!bar) return;
  function update() {
    if (window.scrollY > 8) bar.classList.add('is-scrolled');
    else bar.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', update, { passive: true });
  update();
})();
