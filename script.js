(function () {
  var root = document.documentElement;
  var header = document.querySelector('.header');

  // Theme toggle: follows the system until the visitor picks one.
  document.querySelector('.theme-toggle').addEventListener('click', function () {
    var current = root.dataset.theme ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Show the name in the header once the big heading has scrolled away.
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 120);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Highlight the nav link for the section in view.
  var nav = document.querySelector('.nav');
  var links = Array.prototype.slice.call(nav.querySelectorAll('a'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

  function setActive(link) {
    links.forEach(function (a) { a.classList.toggle('active', a === link); });
    if (link) nav.scrollTo({ left: link.offsetLeft - nav.offsetLeft - 16, behavior: 'smooth' });
  }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && byId[entry.target.id]) setActive(byId[entry.target.id]);
      });
    }, { rootMargin: '-30% 0px -65% 0px' });
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
