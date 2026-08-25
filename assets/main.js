// Vanilla JS progressive enhancement: theme toggle, mobile nav, project tag
// filter, and active-section nav highlighting. No framework, no build step.
(function () {
  'use strict';

  // ---- Theme toggle -------------------------------------------------------
  var themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  // ---- Mobile nav toggle ---------------------------------------------------
  var navToggle = document.getElementById('nav-toggle');
  var navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---- Project tag filter ---------------------------------------------------
  var tagFilter = document.querySelector('.tag-filter');
  var projectCards = document.querySelectorAll('.project-card');
  if (tagFilter && projectCards.length) {
    tagFilter.addEventListener('click', function (event) {
      var chip = event.target.closest('.tag-chip');
      if (!chip) return;

      tagFilter.querySelectorAll('.tag-chip').forEach(function (c) {
        c.classList.remove('is-active');
      });
      chip.classList.add('is-active');

      var tag = chip.dataset.tag;
      projectCards.forEach(function (card) {
        var tags = (card.dataset.tags || '').split(',');
        var show = tag === 'all' || tags.indexOf(tag) !== -1;
        card.classList.toggle('is-hidden', !show);
      });
    });
  }

  // ---- Active section highlight in nav --------------------------------------
  var sections = document.querySelectorAll('main section[id]');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="/#"]');
  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute('id');
          navAnchors.forEach(function (a) {
            var match = a.getAttribute('href') === '/#' + id;
            a.setAttribute('aria-current', match ? 'true' : 'false');
          });
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach(function (section) {
      observer.observe(section);
    });
  }
})();
