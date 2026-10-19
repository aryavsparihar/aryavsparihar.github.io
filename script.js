(function () {
  var root = document.documentElement;

  // Theme toggle: explicit choice is remembered; otherwise follow the system.
  var toggle = document.querySelector('.theme-toggle');
  toggle.addEventListener('click', function () {
    var current = root.dataset.theme ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    var next = current === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Highlight the nav link for the section in view.
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  var nav = document.querySelector('.nav');

  function setActive(link) {
    links.forEach(function (a) { a.classList.remove('active'); });
    link.classList.add('active');
    // On narrow screens the nav scrolls sideways; keep the active link visible.
    nav.scrollTo({ left: link.offsetLeft - nav.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2, behavior: 'smooth' });
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var link = byId[entry.target.id];
        if (link) setActive(link);
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
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
