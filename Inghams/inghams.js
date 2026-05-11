// Minimal scroll reveal — uses IntersectionObserver, runs once per element
(function() {
  if (typeof IntersectionObserver === 'undefined') return;
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

// Gallery progress indicator
(function() {
  var bars = document.querySelectorAll('[data-gallery-progress]');
  bars.forEach(function(bar) {
    var track = bar.previousElementSibling;
    if (!track) return;
    var fill = bar.querySelector('.iterations-progress-bar');
    if (!fill) return;

    function update() {
      var max = track.scrollWidth - track.clientWidth;
      var pct = max > 0 ? (track.scrollLeft / max) : 0;
      fill.style.transform = 'translateX(' + (pct * 300) + '%)';
    }
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
