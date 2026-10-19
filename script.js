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

  // Easter egg: clicking the photo shows a watch-tapping cat for 2 seconds, with a synthesised meow.
  var portraitBtn = document.querySelector('.portrait-btn');
  var huh = document.getElementById('huh');
  var huhTimer = null;
  var audioCtx = null;

  // Builds a "mi-aaa-ow" into any audio context: a buzzy source whose pitch rises then falls,
  // shaped by two formant filters that sweep from "ee" through "aa" to "ow".
  function buildMeow(ctx, t, dest) {
    var dur = 0.75;
    var src = ctx.createOscillator(); src.type = 'sawtooth';
    src.frequency.setValueAtTime(420, t);
    src.frequency.exponentialRampToValueAtTime(720, t + 0.22);
    src.frequency.setValueAtTime(720, t + 0.3);
    src.frequency.exponentialRampToValueAtTime(380, t + dur);
    var vib = ctx.createOscillator(); vib.frequency.value = 7;
    var vibAmt = ctx.createGain(); vibAmt.gain.value = 12;
    vib.connect(vibAmt); vibAmt.connect(src.frequency);

    var amp = ctx.createGain();
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(0.35, t + 0.06);   // soft "m"
    amp.gain.exponentialRampToValueAtTime(1, t + 0.18);
    amp.gain.setValueAtTime(1, t + 0.45);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    var f1 = ctx.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 5;
    f1.frequency.setValueAtTime(350, t);
    f1.frequency.linearRampToValueAtTime(950, t + 0.3);
    f1.frequency.linearRampToValueAtTime(600, t + dur);
    var f2 = ctx.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 7;
    f2.frequency.setValueAtTime(2300, t);
    f2.frequency.linearRampToValueAtTime(1500, t + 0.3);
    f2.frequency.linearRampToValueAtTime(900, t + dur);
    var g1 = ctx.createGain(); g1.gain.value = 3;
    var g2 = ctx.createGain(); g2.gain.value = 1.6;

    src.connect(f1); f1.connect(g1); g1.connect(amp);
    src.connect(f2); f2.connect(g2); g2.connect(amp);
    amp.connect(dest);
    src.start(t); vib.start(t);
    src.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
  }

  function playMeow() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      audioCtx = audioCtx || new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var out = audioCtx.createGain(); out.gain.value = 0.35; out.connect(audioCtx.destination);
      buildMeow(audioCtx, audioCtx.currentTime + 0.05, out);
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
