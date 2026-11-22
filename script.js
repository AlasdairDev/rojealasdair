(function () {
  'use strict';

  /* Leave the frame if the host cannot send frame headers. */
  if (window.top !== window.self) {
    try { window.top.location = window.self.location; }
    catch { document.documentElement.setAttribute('hidden', ''); }
  }

  var menuBtn = document.getElementById('menuBtn');
  var drawer = document.getElementById('drawer');

  function closeMenu() {
    document.body.classList.remove('menu-open');
    if (menuBtn) {
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.textContent = 'Menu';
    }
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? 'Close' : 'Menu';
    });
  }

  if (drawer) {
    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 1080) closeMenu();
  });

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));

  function setActive(id) {
    navLinks.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
    });
  }

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-22% 0px -68% 0px', threshold: 0 });

    sections.forEach(function (s) { spy.observe(s); });
  }

  var ledger = document.getElementById('ledger');
  var ledgerMore = document.getElementById('ledgerMore');
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var rows = Array.prototype.slice.call(document.querySelectorAll('.row'));

  if (ledger && ledgerMore) {
    var totalRows = ledger.querySelectorAll('.row').length;
    ledgerMore.textContent = 'Show all ' + totalRows + ' projects';
    ledgerMore.addEventListener('click', function () {
      var collapsed = ledger.classList.toggle('is-collapsed');
      ledgerMore.setAttribute('aria-expanded', String(!collapsed));
      ledgerMore.textContent = collapsed ? 'Show all ' + totalRows + ' projects' : 'Show fewer projects';
    });
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-filter');

      filters.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', String(on));
      });

      if (ledger) ledger.classList.toggle('is-filtered', key !== 'all');

      rows.forEach(function (row) {
        row.classList.toggle('is-hidden', key !== 'all' && row.getAttribute('data-cat') !== key);
      });
    });
  });

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
