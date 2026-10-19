(function () {
  var root = document.documentElement;

  // Theme toggle: follows the system until the visitor picks one.
  document.querySelector('.theme-toggle').addEventListener('click', function () {
    var current = root.dataset.theme ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = current === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // Project filters.
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var projects = document.querySelectorAll('.project');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      filters.forEach(function (b) { b.classList.toggle('active', b === btn); });
      projects.forEach(function (p) {
        var tags = (p.dataset.tags || '').split(' ');
        p.classList.toggle('hidden', f !== 'all' && tags.indexOf(f) === -1);
      });
    });
  });

  // Figure 1: small in the project card, enlarged in a dialog on click.
  var figOpen = document.querySelector('.fig-open');
  var figDialog = document.getElementById('fig1-dialog');
  if (figOpen && figDialog && typeof figDialog.showModal === 'function') {
    var figSvg = figOpen.querySelector('svg');
    var figHome = figOpen.querySelector('.fig-slot');
    var figSlot = figDialog.querySelector('.fig-dialog-slot');
    figOpen.addEventListener('click', function () {
      figSlot.appendChild(figSvg);
      figDialog.showModal();
    });
    figDialog.querySelector('.fig-close').addEventListener('click', function () { figDialog.close(); });
    figDialog.addEventListener('click', function (e) { if (e.target === figDialog) figDialog.close(); });
    figDialog.addEventListener('close', function () { figHome.appendChild(figSvg); });
  }

  // Easter egg: clicking the photo shows a watch-tapping cat for 2 seconds, with a real meow
  // (CC0 recording "Meow of a Siamese cat" by freemaster2, Wikimedia Commons).
  var portraitBtn = document.querySelector('.portrait-btn');
  var huh = document.getElementById('huh');
  var huhTimer = null;
  var meow = null;

  function playMeow() {
    try {
      meow = meow || new Audio('assets/meow.m4a');
      meow.currentTime = 0;
      var p = meow.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  function hideHuh() {
    huh.classList.remove('show');
    huh.setAttribute('aria-hidden', 'true');
    clearTimeout(huhTimer);
  }

  if (portraitBtn && huh) {
    portraitBtn.addEventListener('click', function () {
      hideHuh();
      void huh.offsetWidth; // restart the animations on repeat clicks
      huh.classList.add('show');
      huh.setAttribute('aria-hidden', 'false');
      playMeow();
      huhTimer = setTimeout(hideHuh, 2000);
    });
    huh.addEventListener('click', hideHuh);
  }

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
