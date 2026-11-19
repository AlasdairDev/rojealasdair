/* ══════════════════════════════════════════════════════════════
   Roje Alasdair Evangelista — behaviour
   Menu, project filter, year. No canvas, no loops, no observers.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── MOBILE MENU ───────────────────────────────────────────── */
  var menuBtn = document.getElementById('menu');
  var nav = document.getElementById('nav');

  function closeMenu() {
    document.body.classList.remove('nav-open');
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.setAttribute('aria-label', 'Open menu');
    }
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  if (nav) {
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) closeMenu();
  });

  /* ── FILTER ────────────────────────────────────────────────── */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.card'));

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-filter');

      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });

      cards.forEach(function (card) {
        card.classList.toggle('is-hidden', key !== 'all' && card.getAttribute('data-cat') !== key);
      });
    });
  });

  /* ── YEAR ──────────────────────────────────────────────────── */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
