(function () {
  var root = document.documentElement;
  var nav = document.querySelector('.nav');
  var menuToggle = document.querySelector('.menu-toggle');

  // Theme toggle: light by default, choice is remembered.
  document.querySelector('.theme-toggle').addEventListener('click', function () {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Mobile menu.
  menuToggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });

  var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
  links.forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Highlight the nav link for the section in view.
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

  function setActive(link) {
    links.forEach(function (a) { a.classList.toggle('active', a === link); });
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && byId[entry.target.id]) setActive(byId[entry.target.id]);
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { observer.observe(s); });

    // The last section is short, so mark it active once the page bottom is reached.
    window.addEventListener('scroll', function () {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        setActive(links[links.length - 1]);
      }
    }, { passive: true });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
