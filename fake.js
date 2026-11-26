/* Fake (ragebait) experience. Fully separate: never touches the romantic scenes. */
(() => {
  const msgs = ['> booting…','> convincing the pixels to cooperate…','> asking the hamster to run faster 🐹','> polishing the surprise…','> wrapping the gift 🎀','> almost there (probably)…','> untangling the confetti…','> buffering emotions…'];
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const every = (fn, ms) => timers.push(setInterval(fn, ms));
  const clear = () => { timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = []; };
  const stage = n => document.querySelectorAll('#s-fake .fk-st').forEach((s, i) => s.classList.toggle('on', i === n - 1));
  const pct = v => { $('#fkpct').textContent = Math.floor(v) + '%'; $('#fkfill').style.width = v + '%'; };

  function loading() {
    clear(); stage(1);
    $('#fkskip').hidden = true; $('#fkmsg').textContent = msgs[0];
    let p = 0, m = 0;
    pct(0);
    every(() => {
      if (p < 80) p += 1.3; else if (p < 99) p += 0.35; else p = 99;
      pct(p);
      if (p >= 99 && $('#fkskip').hidden) {
        $('#fkmsg').textContent = '> 99%… 99%… still 99%…';
        later(() => { $('#fkskip').hidden = false; }, 900);
      }
    }, 100);
    every(() => { if (p < 99) $('#fkmsg').textContent = msgs[++m % msgs.length]; }, 1300);
  }
  function drumroll() {
    clear(); stage(3);
    const box = $('#fkbox'); box.textContent = '🎁'; box.className = 'fk-box';
    ['#fkres', '#fkres2', '#fkwhat'].forEach(s => $(s).hidden = true);
    $('#fkdrum').hidden = false; $('#fkdrum').textContent = '> drumroll…';
    later(() => $('#fkdrum').textContent = '> 3…', 900);
    later(() => $('#fkdrum').textContent = '> 2…', 1700);
    later(() => $('#fkdrum').textContent = '> 1…', 2500);
    later(() => {
      box.textContent = '🥄'; box.className = 'fk-box done';
      $('#fkdrum').hidden = true;
      ['#fkres', '#fkres2'].forEach(s => $(s).hidden = false);
      later(() => $('#fkwhat').hidden = false, 900);
    }, 3300);
  }
  function credits() {
    clear(); stage(4);
    const roll = document.querySelector('.fk-credits .roll');
    roll.style.animation = 'none'; void roll.offsetWidth; roll.style.animation = '';
    $('#fkend').hidden = true;
    later(() => $('#fkend').hidden = false, reduceMotionFake() ? 600 : 11000);
  }
  const reduceMotionFake = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.startFake = () => {
    document.body.classList.add('fake');
    au.pause();
    go('s-fake');
    loading();
  };
  $('#fkskip').onclick = () => { clear(); pct(100); stage(2); };
  $('#fkgift').onclick = drumroll;
  $('#fkwhat').onclick = credits;
  $('#fkagain').onclick = loading;
})();
