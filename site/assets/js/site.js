/* Shared chrome: theme toggle + mobile nav. No dependencies, no network calls. */
(function () {
  var root = document.documentElement;

  var toggle = document.querySelector('.theme-btn');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var current = root.getAttribute('data-theme');
      if (!current) {
        current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      var next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('pc-theme', next); } catch (e) {}
      toggle.setAttribute('aria-label', next === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }

  var navBtn = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (navBtn && nav) {
    navBtn.addEventListener('click', function () {
      var open = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', String(!open));
      navBtn.setAttribute('aria-expanded', String(!open));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.setAttribute('data-open', 'false');
        navBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Mark the current page in the nav without hand-editing every file. */
  function pageKey(path) {
    var base = path.split('/').pop() || 'index.html';
    return base.replace(/\.html$/, '').replace(/^$/, 'index');
  }
  var here = pageKey(location.pathname);
  document.querySelectorAll('.nav__list a').forEach(function (a) {
    if (pageKey(a.getAttribute('href')) === here) a.setAttribute('aria-current', 'page');
  });
})();
