/* ============================================================
   Елена — колорист. Интерактив лендинга.
   ============================================================ */

(function () {
  'use strict';

  var doc = document;

  /* ---------- Тень шапки при скролле ---------- */

  var header = doc.getElementById('header');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* ---------- Мобильное меню ---------- */

  var burger = doc.getElementById('burger');
  var nav = doc.getElementById('nav');

  function isNavOpen() {
    return !!nav && nav.classList.contains('is-open');
  }

  function openNav() {
    if (!nav || !burger) {
      return;
    }
    nav.classList.add('is-open');
    burger.classList.add('is-active');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
    doc.body.classList.add('nav-open');
    if (header) {
      header.classList.add('is-nav-open');
    }
  }

  function closeNav(returnFocus) {
    if (!nav || !burger) {
      return;
    }
    nav.classList.remove('is-open');
    burger.classList.remove('is-active');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
    doc.body.classList.remove('nav-open');
    if (header) {
      header.classList.remove('is-nav-open');
    }
    if (returnFocus) {
      burger.focus();
    }
  }

  function toggleNav() {
    if (isNavOpen()) {
      closeNav(false);
    } else {
      openNav();
    }
  }

  if (burger) {
    burger.addEventListener('click', toggleNav);
  }

  if (nav) {
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeNav(false);
      });
    });
  }

  doc.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && isNavOpen()) {
      closeNav(true);
    }
  });

  var desktopQuery = window.matchMedia('(min-width: 901px)');

  function handleDesktopChange(event) {
    if (event.matches) {
      closeNav(false);
    }
  }

  if (typeof desktopQuery.addEventListener === 'function') {
    desktopQuery.addEventListener('change', handleDesktopChange);
  } else if (typeof desktopQuery.addListener === 'function') {
    desktopQuery.addListener(handleDesktopChange);
  }

  /* ---------- Год в футере ---------- */

  var yearEl = doc.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Подсветка активного пункта меню ---------- */

  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.nav__link[href^="#"]'));
  var sections = navLinks
    .map(function (link) {
      return doc.getElementById(link.hash.slice(1));
    })
    .filter(Boolean);

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var isActive = link.hash === '#' + id;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      spy.observe(section);
    });
  }

  /* ---------- Плавное появление блоков ---------- */

  var revealItems = Array.prototype.slice.call(doc.querySelectorAll('.reveal'));

  if ('IntersectionObserver' in window && revealItems.length) {
    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  /* Страховка: показываем блоки, попавшие в экран, даже если observer не сработал */
  function revealInView() {
    var viewportHeight = window.innerHeight;

    revealItems.forEach(function (item) {
      if (item.classList.contains('is-visible')) {
        return;
      }

      var rect = item.getBoundingClientRect();
      if (rect.top < viewportHeight - 40 && rect.bottom > 0) {
        item.classList.add('is-visible');
      }
    });
  }

  if (revealItems.length) {
    window.addEventListener('scroll', revealInView, { passive: true });
    window.addEventListener('resize', revealInView, { passive: true });
    revealInView();
  }

  /* Небольшая задержка для карточек галереи */
  Array.prototype.forEach.call(doc.querySelectorAll('.gallery__item'), function (item, index) {
    item.style.setProperty('--reveal-delay', (index % 3) * 70 + 'ms');
  });

  /* Мягкая лесенка для карточек услуг */
  Array.prototype.forEach.call(doc.querySelectorAll('.service-card'), function (item, index) {
    item.style.setProperty('--reveal-delay', (index % 2) * 90 + 'ms');
  });

  /* ---------- Лайтбокс для галереи ---------- */

  var lightbox = doc.getElementById('lightbox');
  var lightboxImg = lightbox ? lightbox.querySelector('.lightbox__img') : null;
  var lightboxClose = lightbox ? lightbox.querySelector('.lightbox__close') : null;
  var lastFocused = null;
  var lightboxTimer = null;
  var lightboxClosing = false;
  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function onLightboxKeydown(event) {
    if (event.key === 'Escape') {
      closeLightbox();
      return;
    }

    if (event.key === 'Tab' && lightboxClose) {
      event.preventDefault();
      lightboxClose.focus();
    }
  }

  function openLightbox(trigger) {
    if (!lightbox || !lightboxImg || !lightboxClose) {
      return;
    }

    var source = trigger.getAttribute('data-full');
    var preview = trigger.querySelector('img');

    if (!source) {
      return;
    }

    if (lightboxTimer) {
      window.clearTimeout(lightboxTimer);
      lightboxTimer = null;
    }

    lightboxClosing = false;
    lastFocused = trigger;
    lightboxImg.src = source;
    lightboxImg.alt = preview ? preview.alt : '';
    lightbox.hidden = false;
    void lightbox.offsetWidth;
    lightbox.classList.add('is-open');
    doc.body.classList.add('is-locked');
    doc.addEventListener('keydown', onLightboxKeydown);
    lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg || lightbox.hidden || lightboxClosing) {
      return;
    }

    lightboxClosing = true;
    lightbox.classList.remove('is-open');
    doc.body.classList.remove('is-locked');
    doc.removeEventListener('keydown', onLightboxKeydown);

    var finishClose = function () {
      lightbox.hidden = true;
      lightboxImg.removeAttribute('src');
      lightboxImg.alt = '';
      lightboxClosing = false;
      lightboxTimer = null;

      if (lastFocused) {
        lastFocused.focus();
        lastFocused = null;
      }
    };

    lightboxTimer = window.setTimeout(finishClose, reduceMotion ? 0 : 260);
  }

  if (lightbox) {
    Array.prototype.forEach.call(doc.querySelectorAll('.gallery__item'), function (trigger) {
      trigger.addEventListener('click', function () {
        openLightbox(trigger);
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });
  }
})();

