/* ============================================================
   KESHAV TAXI — interactions & animations
   ============================================================ */
(() => {
  'use strict';

  const WHATSAPP_NUMBER = '918140230020'; // country code + number
  const PHONE = '+918140230020';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- Preloader ---------- */
  window.addEventListener('load', () => {
    setTimeout(() => $('#preloader')?.classList.add('done'), 550);
  });

  /* ---------- Year ---------- */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- Theme toggle (dark / light) ---------- */
  const THEME_KEY = 'keshav-theme';
  const root = document.documentElement;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const syncMeta = () =>
    metaTheme && (metaTheme.content = root.getAttribute('data-theme') === 'light' ? '#f5f2ea' : '#0a0a0a');
  syncMeta();
  $('#themeToggle')?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    syncMeta();
  });

  /* ---------- Nav scroll state + scroll progress ---------- */
  const nav = $('#nav');
  const progress = $('#scrollProgress');
  const scrollCab = $('#scrollCab');
  const onScroll = () => {
    const sc = window.scrollY;
    nav?.classList.toggle('scrolled', sc > 20);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = h > 0 ? Math.min(sc / h, 1) : 0;
    if (progress) progress.style.width = (pct * 100) + '%';
    if (scrollCab) scrollCab.style.top = (pct * 100) + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const toggle = $('#navToggle');
  const links = $('#navLinks');
  toggle?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.nav__link').forEach(l => l.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.classList.remove('open');
    document.body.style.overflow = '';
  }));

  /* ---------- Active nav link on scroll ---------- */
  const sections = ['home', 'services', 'packages', 'fleet', 'fares', 'book']
    .map(id => document.getElementById(id)).filter(Boolean);
  const navMap = new Map($$('.nav__link').map(a => [a.getAttribute('href'), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navMap.forEach(a => a.classList.remove('active'));
        navMap.get('#' + e.target.id)?.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const revealer = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach(el => revealer.observe(el));

  /* ---------- Counter animation ---------- */
  const fmt = n => n >= 1000 ? Math.floor(n).toLocaleString('en-IN') : Math.floor(n);
  const countUp = el => {
    const target = +el.dataset.count;
    const dur = 1600; const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = fmt(target);
    };
    requestAnimationFrame(tick);
  };
  const countObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => { if (e.isIntersecting) { countUp(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => countObs.observe(el));

  /* ---------- Hero parallax ---------- */
  const parallax = $$('[data-parallax]');
  if (parallax.length && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    window.addEventListener('scroll', () => {
      const sc = window.scrollY;
      parallax.forEach(el => {
        const speed = +el.dataset.parallax;
        el.style.transform = `translateY(${sc * speed}px)`;
      });
    }, { passive: true });
  }

  /* ---------- Route map: cab travels along the path ---------- */
  const path = $('#routePath');
  const cab = $('#routeCab');
  if (path && cab && 'getTotalLength' in path) {
    const len = path.getTotalLength();
    let t = 0;
    const drive = () => {
      t = (t + 0.0016) % 1;
      const pt = path.getPointAtLength(t * len);
      const pt2 = path.getPointAtLength(Math.min(t + 0.01, 1) * len);
      const ang = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI;
      const flip = (ang > 90 || ang < -90) ? -1 : 1;
      cab.setAttribute('transform', `translate(${pt.x},${pt.y}) scale(${flip},1)`);
      requestAnimationFrame(drive);
    };
    drive();
  }

  /* ---------- WhatsApp helpers ---------- */
  const waURL = msg =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

  // Generic quick-links
  $$('.wa-link').forEach(el => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', ev => {
      ev.preventDefault();
      const msg = el.dataset.msg || 'Hi Karancab, I have an enquiry.';
      window.open(waURL(msg), '_blank');
    });
  });

  /* ---------- Toast ---------- */
  const toast = $('#toast');
  let toastTimer;
  const showToast = html => {
    if (!toast) return;
    toast.innerHTML = html;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  };

  /* ---------- Quick quote form (hero) ---------- */
  $('#quickForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const msg =
      `*Fare Enquiry — Karancab*\n` +
      `• Pickup: ${f.from.value}\n` +
      `• Destination: ${f.to.value}\n` +
      `• Car: ${f.car.value}\n` +
      (f.date.value ? `• Date: ${f.date.value}\n` : '') +
      `\nPlease share the best fare. Thank you!`;
    showToast('Opening WhatsApp… <b>we\'ll confirm your fare shortly</b>');
    window.open(waURL(msg), '_blank');
  });

  /* ---------- Booking form ---------- */
  $('#bookForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    if (!/^\d{10}$/.test(f.phone.value.replace(/\D/g, '').slice(-10))) {
      showToast('Please enter a valid <b>10-digit mobile number</b>');
      f.phone.focus();
      return;
    }
    const msg =
      `*New Booking Request — Karancab*\n` +
      `• Name: ${f.name.value}\n` +
      `• Phone: ${f.phone.value}\n` +
      `• Destination: ${f.to.value}\n` +
      `• Vehicle: ${f.car.value}\n` +
      (f.date.value ? `• Travel Date: ${f.date.value}\n` : '') +
      (f.note.value ? `• Note: ${f.note.value}\n` : '') +
      `\nPlease confirm availability & fare. Thank you!`;
    showToast('Thanks <b>' + (f.name.value.split(' ')[0] || '') + '</b>! Redirecting to WhatsApp…');
    window.open(waURL(msg), '_blank');
    f.reset();
  });

  /* ---------- Set min date to today on all date inputs ---------- */
  const today = new Date().toISOString().split('T')[0];
  $$('input[type="date"]').forEach(d => d.min = today);

})();
