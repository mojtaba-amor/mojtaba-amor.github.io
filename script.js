// Menu mobile
const menuBtn = document.querySelector('.menu-btn');
const nav = document.getElementById('nav');
menuBtn.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
nav.addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});

// Captures : si l'image existe, on la montre ; sinon le texte "Capture à ajouter" reste visible
document.querySelectorAll('.shot').forEach(shot => {
  const img = shot.querySelector('img');
  const ok = () => { shot.classList.add('has-img'); shot.querySelector('.ph').hidden = true; };
  const ko = () => img.remove();
  if (img.complete) { img.naturalWidth ? ok() : ko(); }
  else { img.addEventListener('load', ok); img.addEventListener('error', ko); }
});

// Filtres du portfolio
const filterBtns = document.querySelectorAll('.filters button');
const projects = document.querySelectorAll('.project');
filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => b.classList.toggle('on', b === btn));
  const f = btn.dataset.filter;
  projects.forEach(p => { p.hidden = !(f === 'all' || p.dataset.cat.split(' ').includes(f)); });
}));

// Agrandir une capture
const lb = document.getElementById('lightbox');
const lbImg = lb.querySelector('img');
const closeLb = () => { lb.hidden = true; lbImg.removeAttribute('src'); };
document.querySelectorAll('.shot').forEach(shot => shot.addEventListener('click', () => {
  const img = shot.querySelector('img');
  if (!img) return;
  lbImg.src = img.src; lbImg.alt = img.alt; lb.hidden = false;
}));
lb.addEventListener('click', closeLb);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
