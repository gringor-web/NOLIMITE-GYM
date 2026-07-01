/* ==========================================================================
   LÍMITE GYM — script.js
   Deferred, non-blocking. Progressive enhancement: the page works without it.
   --------------------------------------------------------------------------
   1. Header blur on scroll      4. Reveal on scroll      7. Count-up stats
   2. Mobile nav toggle          5. Active nav link       8. Accessible form
   3. Smooth scroll              6. Image load / error    9. Footer year
   ========================================================================== */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initHeroVideo();
    initMobileNav();
    initSmoothScroll();
    initReveal();
    initActiveNav();
    initMedia();
    initLightbox();
    initCounters();
    initContactForm();
    initFooterYear();
    initCookies();
  });

  /* 1. Header blur on scroll --------------------------------------------- */
  function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const THRESHOLD = 24;
    let ticking = false;

    const update = () => {
      header.classList.toggle('is-scrolled', window.scrollY > THRESHOLD);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* 1b. Hero video (vídeo dentro del texto) ------------------------------ */
  function initHeroVideo() {
    const wrap = document.querySelector('.hero-mask-wrap');
    const video = wrap && wrap.querySelector('.hero-video');
    if (!wrap || !video) return;

    // Si el vídeo no carga, mostrar el texto con degradado (nunca una caja negra)
    const useFallback = () => wrap.classList.add('is-fallback');
    video.addEventListener('error', useFallback);
    const source = video.querySelector('source');
    if (source) source.addEventListener('error', useFallback);

    // Reproducción (autoplay + muted ya debería bastar)
    const p = video.play();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  }

  /* 2. Mobile nav toggle -------------------------------------------------- */
  function initMobileNav() {
    const toggle = document.getElementById('navToggle');
    const panel = document.getElementById('navCollapse');
    if (!toggle || !panel) return;

    const setOpen = (open) => {
      panel.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
    };

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Cerrar al elegir un enlace
    panel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });

    // Cerrar con Escape (devuelve el foco al botón)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    // Si se pasa a escritorio, normalizar estado
    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* 3. Smooth scroll to in-page targets ---------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('[data-scroll-target]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('data-scroll-target'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
        // Mover el foco al destino para usuarios de teclado/lector
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  /* 4. Reveal on scroll --------------------------------------------------- */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

    items.forEach((el) => observer.observe(el));
  }

  /* 5. Active nav link (scroll spy) -------------------------------------- */
  function initActiveNav() {
    const links = Array.from(document.querySelectorAll('.primary-nav a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;

    const map = new Map();
    links.forEach((link) => {
      const section = document.querySelector(link.getAttribute('href'));
      if (section) map.set(section, link);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = map.get(entry.target);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((l) => l.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'page');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    map.forEach((_, section) => observer.observe(section));
  }

  /* 6. Image load / error (fade-in + graceful placeholder) --------------- */
  function initMedia() {
    document.querySelectorAll('.media-frame img, .trainer-media img, .program-media img, .gallery-img').forEach((img) => {
      const markLoaded = () => img.classList.add('is-loaded');
      if (img.complete && img.naturalWidth > 0) {
        markLoaded();
      } else {
        img.addEventListener('load', markLoaded, { once: true });
        // Si la imagen no existe aún, se mantiene el degradado del contenedor
        img.addEventListener('error', () => img.remove(), { once: true });
      }
    });
  }

  /* 6b. Lightbox (galería de instalaciones) ------------------------------ */
  function initLightbox() {
    const dialog = document.getElementById('lightbox');
    const triggers = document.querySelectorAll('.gallery-trigger');
    if (!dialog || !triggers.length) return;

    // Sin soporte de <dialog>: se mantiene la galería sin ampliación
    if (typeof dialog.showModal !== 'function') return;

    const img = dialog.querySelector('.lightbox-img');
    const caption = dialog.querySelector('.lightbox-caption');
    const closeBtn = dialog.querySelector('.lightbox-close');

    triggers.forEach((btn) => {
      btn.addEventListener('click', () => {
        const full = btn.dataset.full;
        if (!full) return;
        const cap = btn.dataset.caption || '';
        img.src = full;
        img.alt = cap ? 'Instalación: ' + cap : 'Imagen de la instalación';
        caption.textContent = cap;
        dialog.showModal();
      });
    });

    closeBtn.addEventListener('click', () => dialog.close());
    // Cerrar al pulsar fuera de la imagen (sobre el fondo)
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
    // Liberar la imagen al cerrar
    dialog.addEventListener('close', () => img.removeAttribute('src'));
  }

  /* 7. Count-up stats ----------------------------------------------------- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count-to]');
    if (!counters.length) return;

    const run = (el) => {
      const end = parseInt(el.dataset.countTo, 10) || 0;
      const suffix = el.dataset.suffix || '';
      if (prefersReduced) { el.textContent = end.toLocaleString('es-ES') + suffix; return; }

      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = Math.round(end * eased).toLocaleString('es-ES') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(run);
      return;
    }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { run(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => observer.observe(el));
  }

  /* 8. Accessible contact form ------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const status = document.getElementById('formStatus');
    const honeypot = form.querySelector('#website');

    const validators = {
      nombre: (v) => v.trim().length >= 2,
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      mensaje: (v) => v.trim().length >= 5,
    };

    const setFieldError = (field, hasError) => {
      const error = form.querySelector(`[data-error-for="${field.id}"]`);
      field.setAttribute('aria-invalid', String(hasError));
      if (error) {
        error.hidden = !hasError;
        if (hasError) {
          field.setAttribute('aria-describedby', error.id || (error.id = `err-${field.id}`));
        }
      }
    };

    // Validación al salir del campo (no en cada tecla)
    Object.keys(validators).forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      field.addEventListener('blur', () => {
        if (field.value) setFieldError(field, !validators[name](field.value));
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.className = 'form-status';
      status.textContent = '';

      // Honeypot: si está relleno, es un bot → ignorar en silencio
      if (honeypot && honeypot.value) return;

      let firstInvalid = null;
      Object.keys(validators).forEach((name) => {
        const field = form.elements[name];
        const valid = validators[name](field.value);
        setFieldError(field, !valid);
        if (!valid && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        status.classList.add('is-error');
        status.textContent = 'Revisa los campos marcados antes de enviar.';
        firstInvalid.focus();
        return;
      }

      // Demo sin backend: confirmación. Conecta aquí tu servicio (email/CRM).
      status.classList.add('is-success');
      status.textContent = '¡Gracias! Hemos recibido tu mensaje y te contactaremos muy pronto.';
      form.reset();
      Object.keys(validators).forEach((name) => {
        const field = form.elements[name];
        if (field) field.setAttribute('aria-invalid', 'false');
      });
    });
  }

  /* 9. Footer year -------------------------------------------------------- */
  function initFooterYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* 10. Consentimiento de cookies (RGPD) ---------------------------------- */
  function initCookies() {
    const STORAGE_KEY = 'limitegym_cookie_consent';
    const banner = document.getElementById('cookieBanner');
    if (!banner) return;

    const modal = document.getElementById('cookieModal');
    const analyticsInput = document.getElementById('cookieAnalytics');
    const marketingInput = document.getElementById('cookieMarketing');

    const read = () => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); }
      catch (e) { return null; }
    };

    const apply = (consent) => {
      // Punto de enganche para cargar scripts según el consentimiento
      document.documentElement.dataset.consentAnalytics = consent.analytics ? '1' : '0';
      document.documentElement.dataset.consentMarketing = consent.marketing ? '1' : '0';
    };

    const save = (analytics, marketing) => {
      const consent = {
        necessary: true,
        analytics: !!analytics,
        marketing: !!marketing,
        ts: new Date().toISOString(),
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(consent)); } catch (e) {}
      apply(consent);
      return consent;
    };

    const showBanner = () => banner.classList.add('is-visible');
    const hideBanner = () => banner.classList.remove('is-visible');
    const closeModal = () => { if (modal && modal.open) modal.close(); };

    const openModal = () => {
      const c = read();
      if (analyticsInput) analyticsInput.checked = c ? !!c.analytics : false;
      if (marketingInput) marketingInput.checked = c ? !!c.marketing : false;
      if (modal && typeof modal.showModal === 'function') modal.showModal();
    };

    // Mostrar una sola vez: solo si no hay decisión previa guardada
    const existing = read();
    if (existing) {
      apply(existing);
    } else {
      showBanner();
    }

    // Acciones del banner
    const accept = document.getElementById('cookieAccept');
    const reject = document.getElementById('cookieReject');
    const configure = document.getElementById('cookieConfigure');
    if (accept) accept.addEventListener('click', () => { save(true, true); hideBanner(); });
    if (reject) reject.addEventListener('click', () => { save(false, false); hideBanner(); });
    if (configure) configure.addEventListener('click', openModal);

    // Acciones del modal (el <dialog> nativo gestiona Esc y la trampa de foco)
    if (modal) {
      const saveBtn = document.getElementById('cookieSave');
      const cancelBtn = document.getElementById('cookieCancel');
      const closeBtn = document.getElementById('cookieModalClose');
      if (saveBtn) saveBtn.addEventListener('click', () => {
        save(analyticsInput && analyticsInput.checked, marketingInput && marketingInput.checked);
        closeModal();
        hideBanner();
      });
      if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
      if (closeBtn) closeBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    }

    // Reabrir preferencias desde el pie ("Cookies")
    const reopen = document.getElementById('openCookiePrefs');
    if (reopen) reopen.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
  }
})();
