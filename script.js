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

  // Easter egg: clicking the photo shows a watch-tapping cat for 3 seconds, with a synthesised "huh?".
  var portraitBtn = document.querySelector('.portrait-btn');
  var huh = document.getElementById('huh');
  var huhTimer = null;
  var audioCtx = null;

  function playHuh() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      audioCtx = audioCtx || new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var ctx = audioCtx, t = ctx.currentTime + 0.05;
      var out = ctx.createGain(); out.gain.value = 0.55; out.connect(ctx.destination);

      // "h": a short breathy noise burst
      var len = Math.floor(ctx.sampleRate * 0.12), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      var noise = ctx.createBufferSource(); noise.buffer = buf;
      var nf = ctx.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 1400; nf.Q.value = 0.8;
      var ng = ctx.createGain();
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.exponentialRampToValueAtTime(0.35, t + 0.03);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      noise.connect(nf); nf.connect(ng); ng.connect(out);
      noise.start(t); noise.stop(t + 0.13);

      // "uh?": a voiced vowel whose pitch rises like a question
      var v = t + 0.06;
      var osc = ctx.createOscillator(); osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, v);
      osc.frequency.linearRampToValueAtTime(165, v + 0.12);
      osc.frequency.exponentialRampToValueAtTime(290, v + 0.42);
      var vg = ctx.createGain();
      vg.gain.setValueAtTime(0.0001, v);
      vg.gain.exponentialRampToValueAtTime(1, v + 0.05);
      vg.gain.setValueAtTime(1, v + 0.3);
      vg.gain.exponentialRampToValueAtTime(0.0001, v + 0.48);
      [[700, 6, 4], [1220, 9, 2.4], [2600, 10, 1]].forEach(function (f) {
        var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f[0]; bp.Q.value = f[1];
        var g = ctx.createGain(); g.gain.value = f[2];
        osc.connect(bp); bp.connect(g); g.connect(vg);
      });
      vg.connect(out);
      osc.start(v); osc.stop(v + 0.5);
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
      playHuh();
      huhTimer = setTimeout(hideHuh, 3000);
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
