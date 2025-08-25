// Mobile nav toggle
const btn = document.querySelector('.nav-toggle');
const nav = document.getElementById('primary-nav');
if (btn && nav){
  btn.addEventListener('click', ()=>{
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    nav.style.display = expanded ? 'none' : 'flex';
  });
}

// Floating portrait video player
(function(){
  const float = document.querySelector('.video-float');
  if(!float) return;
  const v = float.querySelector('video');
  const muteBtn = float.querySelector('[data-action="mute"]');
  const expandBtn = float.querySelector('[data-action="expand"]');

  const modal = document.querySelector('.modal');
  const modalVideo = modal?.querySelector('video');
  const modalMuteBtn = modal?.querySelector('[data-action="modal-mute"]');
  const closeBtn = modal?.querySelector('[data-action="minimize"]');

  if (v){
    v.muted = true;
    v.setAttribute('muted', '');
    v.play().catch(()=>{});
  }

  function iconExpand(){ return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 3h7v2H5v5H3V3zm14 0h4v9h-2V5h-7V3h5zM3 12h2v7h7v2H3v-9zm16 0h2v9h-9v-2h7v-7z"/></svg>'; }
  function iconClose(){ return '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.3 5.71L12 12.01l-6.29-6.3-1.41 1.42 6.29 6.29-6.3 6.29 1.42 1.41 6.29-6.29 6.29 6.29 1.41-1.41-6.29-6.29 6.29-6.29z"/></svg>'; }
  function iconVolume(muted){ return muted ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 5V4L8 9H4z"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 10v4h4l5 5V5L7 10H3zm12.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z"/></svg>'; }

  function openModal(){
    if(!modal || !modalVideo) return;
    float.classList.add('hidden');
    modal.classList.add('open');
    modalVideo.currentTime = v.currentTime;
    modalVideo.muted = v.muted;
    if (modalVideo.muted) modalVideo.setAttribute('muted',''); else modalVideo.removeAttribute('muted');
    modalVideo.play().catch(()=>{});
    v.pause();
    if (closeBtn) closeBtn.focus();
    if (modalMuteBtn) modalMuteBtn.innerHTML = iconVolume(modalVideo.muted);
  }
  function closeModal(){
    if(!modal || !modalVideo) return;
    modal.classList.remove('open');
    v.currentTime = modalVideo.currentTime;
    v.muted = modalVideo.muted;
    v.play().catch(()=>{});
    modalVideo.pause();
    float.classList.remove('hidden');
    if (expandBtn) expandBtn.focus();
  }

  if (expandBtn){
    expandBtn.innerHTML = iconExpand();
    expandBtn.addEventListener('click', openModal);
    expandBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openModal(); } });
  }
  if (closeBtn){
    closeBtn.innerHTML = iconClose();
    closeBtn.addEventListener('click', closeModal);
    closeBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); closeModal(); } });
  }
  if (muteBtn){
    muteBtn.innerHTML = iconVolume(true);
    muteBtn.addEventListener('click', ()=>{
      v.muted = !v.muted;
      muteBtn.innerHTML = iconVolume(v.muted);
      v.play().catch(()=>{});
    });
    muteBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); muteBtn.click(); } });
  }
  if (modalMuteBtn){
    modalMuteBtn.innerHTML = iconVolume(true);
    modalMuteBtn.addEventListener('click', ()=>{
      modalVideo.muted = !modalVideo.muted;
      modalMuteBtn.innerHTML = iconVolume(modalVideo.muted);
      modalVideo.play().catch(()=>{});
    });
    modalMuteBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); modalMuteBtn.click(); } });
  }
})();

// Home vertical carousel (arrows + dots + autoplay w/ pause)
(function(){
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('img'));
  const dotsWrap = document.querySelector('.carousel-dots');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');
  const toggleBtn = document.querySelector('.carousel-toggle');
  const carousel = document.querySelector('.carousel');

  let idx = 0;
  let playing = true;
  let interval = 3500;
  let timer = null;

  function setActive(i){
    slides.forEach(s => s.classList.remove('active'));
    dotsWrap.querySelectorAll('button').forEach(d => d.classList.remove('active'));
    slides[i].classList.add('active');
    dotsWrap.children[i]?.classList.add('active');
  }

  function go(n, userInitiated=false){
    idx = (n + slides.length) % slides.length;
    setActive(idx);
    if (userInitiated && playing) restart();
  }

  function next(){ go(idx + 1, true); }
  function prev(){ go(idx - 1, true); }

  function play(){
    if (timer) clearInterval(timer);
    timer = setInterval(()=> go(idx + 1), interval);
    playing = true;
    toggleBtn.innerHTML = '&#10074;&#10074;'; // pause icon
    toggleBtn.setAttribute('aria-label', 'Pause autoplay');
    toggleBtn.setAttribute('aria-pressed', 'false');
  }

  function pause(){
    if (timer) clearInterval(timer);
    timer = null;
    playing = false;
    toggleBtn.innerHTML = '&#9658;'; // play icon
    toggleBtn.setAttribute('aria-label', 'Play slideshow');
    toggleBtn.setAttribute('aria-pressed', 'true');
  }

  function restart(){
    if (playing) { play(); }
  }

  // Init
  slides[0]?.classList.add('active');

  // Dots
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Show slide ${i+1}`);
    if (i === 0) b.classList.add('active');
    b.addEventListener('click', ()=> go(i, true));
    dotsWrap.appendChild(b);
  });

  // Controls
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); next(); }});
  prevBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); prev(); }});

  toggleBtn.addEventListener('click', ()=> playing ? pause() : play());
  toggleBtn.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggleBtn.click(); }});

  // Pause on hover (standard UX)
  carousel.addEventListener('mouseenter', ()=> playing && pause());
  carousel.addEventListener('mouseleave', ()=> !playing && play());

  // Optional: swipe support for touch devices
  let startX = null;
  track.addEventListener('touchstart', (e)=>{ startX = e.touches[0].clientX; }, {passive:true});
  track.addEventListener('touchend', (e)=>{
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) (dx < 0 ? next() : prev());
    startX = null;
  });

  // Kick off autoplay
  play();
})();

// Rooms lightbox
(function(){
  const lb = document.querySelector('.lightbox');
  if(!lb) return;
  const imgEl = lb.querySelector('img');
  const closeBtn = lb.querySelector('[data-lb="close"]');
  const nextBtn = lb.querySelector('[data-lb="next"]');
  const prevBtn = lb.querySelector('[data-lb="prev"]');

  let groups = {};
  document.querySelectorAll('[data-group]').forEach(img=>{
    const g = img.getAttribute('data-group');
    (groups[g]||(groups[g]=[])).push(img);
  });
  Object.values(groups).forEach(arr=>arr.sort((a,b)=>(+a.dataset.index)-(+b.dataset.index)));

  let currentGroup = null;
  let currentIndex = 0;

  function open(g,i){
    currentGroup = g; currentIndex = i;
    const el = groups[g][i];
    imgEl.src = el.src;
    lb.classList.add('open');
    closeBtn.focus();
  }
  function close(){ lb.classList.remove('open'); }
  function move(d){
    if (!currentGroup) return;
    const arr = groups[currentGroup];
    currentIndex = (currentIndex + d + arr.length) % arr.length;
    imgEl.src = arr[currentIndex].src;
  }

  Object.entries(groups).forEach(([g,arr])=>{
    arr.forEach((el, i)=>{
      el.addEventListener('click', ()=>open(g,i));
      el.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(g,i); } });
    });
  });

  closeBtn.addEventListener('click', close);
  nextBtn.addEventListener('click', ()=>move(1));
  prevBtn.addEventListener('click', ()=>move(-1));
  window.addEventListener('keydown', (e)=>{
    if (!lb.classList.contains('open')) return;
    if (e.key==='Escape') close();
    if (e.key==='ArrowRight') move(1);
    if (e.key==='ArrowLeft') move(-1);
  });
})();

