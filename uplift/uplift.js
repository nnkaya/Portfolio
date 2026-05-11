  // Scroll reveal
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

  // Before / After comparison slider
  (function() {
    var sliders = document.querySelectorAll('.compare-slider');
    sliders.forEach(function(slider) {
      var dragging = false;

      function setClip(pct) {
        pct = Math.max(0, Math.min(100, pct));
        slider.style.setProperty('--clip', pct + '%');
        slider.setAttribute('aria-valuenow', Math.round(pct));
      }

      function updateFromX(clientX) {
        var rect = slider.getBoundingClientRect();
        var pct = ((clientX - rect.left) / rect.width) * 100;
        setClip(pct);
      }

      // Initial value
      setClip(50);

      slider.addEventListener('pointerdown', function(e) {
        dragging = true;
        slider.setPointerCapture(e.pointerId);
        updateFromX(e.clientX);
      });
      slider.addEventListener('pointermove', function(e) {
        if (!dragging) return;
        updateFromX(e.clientX);
      });
      slider.addEventListener('pointerup', function(e) {
        dragging = false;
        try { slider.releasePointerCapture(e.pointerId); } catch (_) {}
      });
      slider.addEventListener('pointercancel', function() { dragging = false; });

      // Click anywhere to jump
      slider.addEventListener('click', function(e) {
        if (dragging) return;
        updateFromX(e.clientX);
      });

      // Keyboard support
      slider.addEventListener('keydown', function(e) {
        var current = parseFloat(slider.getAttribute('aria-valuenow')) || 50;
        var step = e.shiftKey ? 10 : 2;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
          setClip(current - step);
          e.preventDefault();
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
          setClip(current + step);
          e.preventDefault();
        } else if (e.key === 'Home') {
          setClip(0);
          e.preventDefault();
        } else if (e.key === 'End') {
          setClip(100);
          e.preventDefault();
        }
      });
    });
  })();

  // Image carousel
  (function() {
    document.querySelectorAll('.phase-carousel').forEach(function(carousel) {
      var track = carousel.querySelector('.carousel-track');
      var slides = carousel.querySelectorAll('.carousel-slide');
      var dotsContainer = carousel.querySelector('.carousel-dots');
      var prevBtn = carousel.querySelector('.carousel-btn.prev');
      var nextBtn = carousel.querySelector('.carousel-btn.next');
      var current = 0;
      var total = slides.length;
      var gap = 20;

      // Create dots
      for (var i = 0; i < total; i++) {
        var dot = document.createElement('span');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.dataset.index = i;
        dotsContainer.appendChild(dot);
      }
      var dots = dotsContainer.querySelectorAll('.carousel-dot');

      function getSlideLeft(index) {
        var offset = 0;
        for (var i = 0; i < index; i++) {
          offset += slides[i].offsetWidth + gap;
        }
        return offset;
      }

      function goTo(index) {
        current = Math.max(0, Math.min(total - 1, index));
        track.scrollTo({ left: getSlideLeft(current), behavior: 'smooth' });
        dots.forEach(function(d, i) {
          d.classList.toggle('active', i === current);
        });
      }

      prevBtn.addEventListener('click', function() { goTo(current - 1); });
      nextBtn.addEventListener('click', function() { goTo(current + 1); });
      dotsContainer.addEventListener('click', function(e) {
        if (e.target.dataset.index !== undefined) goTo(+e.target.dataset.index);
      });

      // Sync dots on scroll
      var scrollTimer;
      track.addEventListener('scroll', function() {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(function() {
          var best = 0, bestDist = Infinity;
          for (var i = 0; i < total; i++) {
            var dist = Math.abs(track.scrollLeft - getSlideLeft(i));
            if (dist < bestDist) { bestDist = dist; best = i; }
          }
          if (best !== current) {
            current = best;
            dots.forEach(function(d, i) {
              d.classList.toggle('active', i === current);
            });
          }
        }, 80);
      }, { passive: true });
    });
  })();

  // Wireframe gallery — drag-to-scroll + progress bar
  (function() {
    document.querySelectorAll('.wf-gallery').forEach(function(gallery) {
      var track = gallery.querySelector('.wf-gallery-track');
      var progressBar = gallery.querySelector('.wf-gallery-progress-bar');
      var isDown = false;
      var startX, scrollLeft;

      track.addEventListener('mousedown', function(e) {
        isDown = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
      });
      track.addEventListener('mouseleave', function() { isDown = false; });
      track.addEventListener('mouseup', function() { isDown = false; });
      track.addEventListener('mousemove', function(e) {
        if (!isDown) return;
        e.preventDefault();
        var x = e.pageX - track.offsetLeft;
        var walk = (x - startX) * 1.5;
        track.scrollLeft = scrollLeft - walk;
      });

      function updateProgress() {
        if (!progressBar) return;
        var maxScroll = track.scrollWidth - track.clientWidth;
        if (maxScroll <= 0) return;
        var progress = track.scrollLeft / maxScroll;
        progressBar.style.transform = 'translateX(' + (progress * 300) + '%)';
      }
      track.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
    });
  })();
// Image zoom modal
(function() {
  var modal = document.getElementById('image-zoom-modal');
  if (!modal) return;
  var backdrop = modal.querySelector('.image-zoom-backdrop');
  var closeBtn = modal.querySelector('.image-zoom-close');
  var modalImg = modal.querySelector('.image-zoom-img');
  var triggers = document.querySelectorAll('.image-zoom-trigger');

  function open(src, alt) {
    modalImg.src = src;
    modalImg.alt = alt || '';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  }
  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
    setTimeout(function() { modalImg.src = ''; }, 320);
  }

  triggers.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var img = btn.querySelector('img');
      if (img) open(img.src, img.alt);
    });
  });
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
  });
})();

// Gallery progress indicator — link previous-sibling scroll position
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
      // bar is 25% wide, translate it from 0 to 75%
      fill.style.transform = 'translateX(' + (pct * 300) + '%)';
    }
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
