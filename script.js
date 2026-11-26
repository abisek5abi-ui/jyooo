const $ = s => document.querySelector(s);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* floating hearts (kept few for performance) */
(() => {
  const box = $('#hearts'), set = ['💗','💕','✨','🌸','💖','⭐'];
  const n = innerWidth < 600 ? 12 : 20;
  for (let i = 0; i < n; i++) {
    const h = document.createElement('i');
    h.textContent = set[i % set.length];
    h.style.cssText = `left:${Math.random()*100}%;font-size:${14+Math.random()*18}px;animation-duration:${9+Math.random()*10}s;animation-delay:${-Math.random()*18}s;--dx:${(Math.random()-.5)*120}px;--rot:${(Math.random()-.5)*60}deg`;
    box.appendChild(h);
  }
})();

/* scenes */
let current = 's-lock';
function go(id) {
  $('#' + current).classList.remove('on');
  current = id;
  const el = $('#' + id);
  el.classList.add('on');
  el.scrollTo(0, 0);
  if (id === 'album') {
    mus.hidden = false;
    setTrack('photos', true);
  }
  if (id === 's-letter') {
    au.pause();
    mus.hidden = true;
  }
  if (id !== 'album' && id !== 's-letter') {
    mus.hidden = true;
  }
  if (id === 's-letter') $('#env').focus({ preventScroll: true });
}

/* password */
const pw = $('#pw');
function tryUnlock() {
  const v = pw.value.trim().toLowerCase();
  if (v && v === CONFIG.realPassword.trim().toLowerCase()) {
    $('#err').textContent = '';
    go('s-ask');
  } else if (v && v === CONFIG.fakePassword.trim().toLowerCase()) {
    $('#err').textContent = '';
    startFake();
  } else {
    $('#err').textContent = 'Hmm, that’s not it. Try again 🥺';
    const f = $('#field'); f.classList.remove('shake'); void f.offsetWidth; f.classList.add('shake');
    pw.select();
  }
}
$('#unlock').onclick = tryUnlock;
pw.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });
$('#eye').onclick = () => {
  const show = pw.type === 'password';
  pw.type = show ? 'text' : 'password';
  $('#eye').textContent = show ? '🙈' : '👁️';
  $('#eye').setAttribute('aria-label', show ? 'Hide password' : 'Show password');
};

/* question */
$('#yes').onclick = () => go('s-yes');
$('#no').onclick = () => go('s-no');
$('#back').onclick = () => go('s-ask');
$('#toAlbum').onclick = () => go('album');
let dodges = 0;
const no = $('#no');
if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce) {
  no.addEventListener('mouseenter', () => {
    if (dodges >= 3) return; // only teases a few times, never impossible
    dodges++;
    no.style.transition = 'transform .25s';
    no.style.transform = `translate(${(Math.random()-.5)*160}px,${(Math.random()-.5)*90}px)`;
  });
}

/* image helper with graceful placeholder */
function photoNode(p) {
  const img = new Image();
  img.src = p.src; img.alt = p.caption; img.loading = 'lazy';
  img.onerror = () => {
    const d = document.createElement('div');
    d.className = 'ph'; d.innerHTML = '💗<small>add a photo here</small>';
    img.replaceWith(d);
  };
  return img;
}

/* album */
const wall = $('#wall');
CONFIG.photos.slice(0, 8).forEach((p, i) => {
  const b = document.createElement('button');
  b.className = 'pol';
  b.setAttribute('aria-label', 'Open photo: ' + p.caption);
  b.appendChild(photoNode(p));
  const c = document.createElement('span'); c.className = 'cap'; c.textContent = p.caption;
  b.appendChild(c);
  b.onclick = () => openLb(i);
  wall.appendChild(b);
});
const lights = $('#lights');
for (let i = 0; i < 16; i++) lights.appendChild(document.createElement('b'));
$('#toLetter').onclick = () => go('s-letter');

/* lightbox */
let idx = 0, lastFocus = null;
const lb = $('#lb'), fig = $('#fig');
function showLb() {
  const p = CONFIG.photos[idx];
  fig.innerHTML = '';
  fig.appendChild(photoNode(p));
  const c = document.createElement('span'); c.className = 'cap'; c.textContent = p.caption;
  fig.appendChild(c);
}
function openLb(i) { idx = i; lastFocus = document.activeElement; showLb(); lb.classList.add('on'); $('#cls').focus(); }
function closeLb() { lb.classList.remove('on'); if (lastFocus) lastFocus.focus({ preventScroll: true }); }
function step(d) { idx = (idx + d + CONFIG.photos.length) % CONFIG.photos.length; showLb(); }
$('#cls').onclick = closeLb;
$('#prev').onclick = e => { e.stopPropagation(); step(-1); };
$('#nxt').onclick = e => { e.stopPropagation(); step(1); };
lb.addEventListener('click', e => { if (!fig.contains(e.target) && !e.target.closest('.nav')) closeLb(); });
addEventListener('keydown', e => {
  if (!lb.classList.contains('on')) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});

/* letter */
(() => {
  const words = CONFIG.letter.split(/\s+/);
  const box = $('#words');
  words.forEach((w, i) => {
    const s = document.createElement('span');
    s.textContent = w + ' ';
    s.style.setProperty('--t', (i * 0.16) + 's');
    box.appendChild(s);
  });
  $('#paper').style.setProperty('--f', (words.length * 0.16 + 0.6) + 's');
  $('#paper h2').textContent = CONFIG.letterTitle;
  $('#env').onclick = () => {
    mus.hidden = false;
    setTrack('letter', true);
    $('#env').classList.add('open');
    setTimeout(() => $('#envWrap').classList.add('fade'), 600);
    setTimeout(() => {
      $('#envWrap').style.display = 'none';
      const p = $('#paper'); p.classList.add('on');
      requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(() => p.classList.add('go'), 900)));
    }, 1200);
  };
})();

/* music — one audio element shared across all scenes */
const au = $('#au'), pp = $('#pp'), mus = $('#music');
let track = null;
function setTrack(key, start = false) {
  if (key === track) {
    if (start) au.play().catch(() => {});
    return;
  }
  const wasPlaying = !au.paused;
  track = key;
  $('#song').textContent = CONFIG.songs[key].title;
  au.src = CONFIG.songs[key].file;
  if (wasPlaying) au.play().catch(() => {}); // keep music going across the change
  else $('#state').textContent = start ? 'starting song…' : 'tap play for our song';
  if (start) {
    au.play().catch(() => {});
  }
}
// Song2 starts only when the envelope is opened.
const missing = () => { $('#state').textContent = 'add ' + CONFIG.songs[track].file; };
pp.onclick = async () => {
  if (au.paused) {
    try { await au.play(); } catch (e) { missing(); }
  } else au.pause();
};
au.onplay = () => { mus.classList.add('playing'); pp.textContent = '❚❚'; pp.setAttribute('aria-label', 'Pause music'); $('#state').textContent = 'now playing'; };
au.onpause = () => { mus.classList.remove('playing'); pp.textContent = '▶'; pp.setAttribute('aria-label', 'Play music'); $('#state').textContent = 'paused'; };
au.onerror = missing;
