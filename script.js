'use strict';

/* ── SECURITY ── */
function sanitize(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/\//g,'&#x2F;');
}
function validTrack(v) { return /^[A-Za-z0-9\-\s]{1,40}$/.test(v); }
function rateLimiter(key, max, ms) {
  const now = Date.now();
  const log = JSON.parse(sessionStorage.getItem(key) || '[]').filter(t => now - t < ms);
  if (log.length >= max) return false;
  sessionStorage.setItem(key, JSON.stringify([...log, now]));
  return true;
}

/* ── CURSOR ── */
const cur = document.getElementById('cur');
const curRing = document.getElementById('cur-ring');
let mx=0,my=0,fx=0,fy=0;
document.addEventListener('mousemove', e => {
  mx=e.clientX; my=e.clientY;
  cur.style.left=mx+'px'; cur.style.top=my+'px';
});
(function tick(){
  fx+=(mx-fx)*0.1; fy+=(my-fy)*0.1;
  curRing.style.left=fx+'px'; curRing.style.top=fy+'px';
  requestAnimationFrame(tick);
})();
document.querySelectorAll('a,button,.service-row,.partner,.process-step').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('ch'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('ch'));
});

/* ── PROGRESS + NAVBAR ── */
const nav = document.getElementById('nav');
const prog = document.getElementById('prog');
window.addEventListener('scroll',()=>{
  prog.style.width = Math.min((window.scrollY/(document.body.scrollHeight-window.innerHeight))*100,100)+'%';
  nav.classList.toggle('stuck', window.scrollY > 80);
},{ passive:true });

/* ── MOBILE NAV ── */
function openMnav(){ document.getElementById('mnav').classList.add('open'); document.body.style.overflow='hidden'; }
function closeMnav(){ document.getElementById('mnav').classList.remove('open'); document.body.style.overflow=''; }

document.getElementById('hamburger').addEventListener('click', openMnav);
document.getElementById('mnav-close').addEventListener('click', closeMnav);
document.querySelectorAll('.mnav-link').forEach(a => a.addEventListener('click', closeMnav));

/* ── SCROLL REVEAL ── */
document.querySelectorAll('.r,.rl,.rr').forEach(el =>
  new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
  },{ threshold:0.1 }).observe(el)
);

/* ── COUNTERS ── */
document.querySelectorAll('.counter').forEach(el=>{
  const target = Math.min(Math.max(parseInt(el.dataset.target,10)||0,0),100000);
  new IntersectionObserver((entries,obs)=>{
    if(!entries[0].isIntersecting) return;
    obs.unobserve(el);
    const start=performance.now();
    (function tick(now){
      const p=Math.min((now-start)/2000,1);
      el.textContent=Math.floor((1-Math.pow(1-p,4))*target);
      if(p<1) requestAnimationFrame(tick); else el.textContent=target;
    })(start);
  },{ threshold:0.5 }).observe(el);
});

/* ── KEN BURNS images ── */
window.addEventListener('load',()=>{
  document.getElementById('heroImg')?.classList.add('loaded');
  document.getElementById('aboutImg')?.classList.add('loaded');
});

/* ── SERVICES ACCORDION ── */
function toggleService(row){
  const isOpen = row.classList.contains('open');
  document.querySelectorAll('.service-row.open').forEach(r=>r.classList.remove('open'));
  if(!isOpen) row.classList.add('open');
}
document.querySelectorAll('.service-row').forEach(row =>
  row.addEventListener('click', () => toggleService(row))
);

/* ── TRACKING ── */
function runTrack(){
  if(!rateLimiter('track',5,60000)){ alert('Too many requests. Please wait a moment.'); return; }
  const raw = document.getElementById('trackInput').value.trim();
  if(!raw){ alert('Please enter a tracking number.'); return; }
  if(!validTrack(raw)){ alert('Invalid format. Letters, numbers and hyphens only (max 40 chars).'); return; }
  document.getElementById('tNum').textContent = raw.toUpperCase();
  const result = document.getElementById('termResult');
  result.classList.add('show');
  setTimeout(()=>result.scrollIntoView({behavior:'smooth',block:'nearest'}),100);
}
document.getElementById('trackInput').addEventListener('keydown',e=>{
  if(e.key==='Enter'){ e.preventDefault(); runTrack(); }
});
document.getElementById('trackBtn').addEventListener('click', runTrack);

/* ── QUOTE FORM ── */
document.getElementById('quoteForm').addEventListener('submit', function(e){
  e.preventDefault();
  if(document.getElementById('hp')?.value !== '') return;
  if(!rateLimiter('quote',3,600000)){ alert('Too many submissions. Please wait a few minutes.'); return; }
  const name    = sanitize(document.getElementById('qName')?.value    || '');
  const phone   = sanitize(document.getElementById('qPhone')?.value   || '');
  const email   = sanitize(document.getElementById('qEmail')?.value   || '');
  const service = sanitize(document.getElementById('qService')?.value || '');
  const cargo   = sanitize(document.getElementById('qCargo')?.value   || '');
  const origin  = sanitize(document.getElementById('qOrigin')?.value  || '');
  const dest    = sanitize(document.getElementById('qDest')?.value    || '');
  const notes   = sanitize(document.getElementById('qNotes')?.value   || '');
  const body = `New Quote Request — G Heroez Website\n\nName:        ${name}\nPhone:       ${phone}\nEmail:       ${email}\nService:     ${service}\nCargo Type:  ${cargo}\nOrigin:      ${origin}\nDestination: ${dest}\nNotes:\n${notes}`;
  const subject = encodeURIComponent('Quote Request — ' + name);
  window.location.href = 'mailto:gheroezshipping@gmail.com?subject=' + subject + '&body=' + encodeURIComponent(body);
  document.getElementById('quoteWrap').style.display='none';
  document.getElementById('formOk').classList.add('show');
});

/* ── BACK TO TOP ── */
const btt = document.getElementById('btt');
btt.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
window.addEventListener('scroll',()=>{
  btt.classList.toggle('show', window.scrollY > 400);
},{ passive:true });
