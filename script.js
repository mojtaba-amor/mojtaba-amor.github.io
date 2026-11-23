/*
 * Portfolio de Mojtaba Amor
 * JavaScript sans dépendance. Compatible avec la CSP du site (aucun script
 * ni style en ligne). Le texte est toujours inséré avec textContent, jamais
 * avec innerHTML.
 */
(() => {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /* ---------- Menu mobile ---------- */
  function initMenu() {
    const button = qs('.menu-btn');
    const nav = qs('#nav');
    if (!button || !nav) return;

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
    };

    button.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    nav.addEventListener('click', (event) => {
      if (event.target instanceof Element && event.target.closest('.nav__link')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        button.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (!(event.target instanceof Node)) return;
      if (nav.classList.contains('is-open') && !nav.contains(event.target) && !button.contains(event.target)) {
        setOpen(false);
      }
    });
    window.matchMedia('(min-width: 721px)').addEventListener('change', (event) => {
      if (event.matches) setOpen(false);
    });
  }

  /* ---------- Lien actif dans la navigation ---------- */
  function initActiveLink() {
    if (!('IntersectionObserver' in window)) return;
    const links = new Map(
      qsa('.nav__link[href^="#"]').map((link) => [link.getAttribute('href').slice(1), link])
    );
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.removeAttribute('aria-current'));
        const active = links.get(entry.target.id);
        if (active) active.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    links.forEach((_, id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  /* ---------- Terminal d’accueil : les commandes se tapent une à une ---------- */
  async function initTerminal() {
    const terminal = qs('.terminal');
    if (!terminal || prefersReducedMotion()) return;

    const lines = qsa('.terminal__line', terminal);
    const cursor = qs('.terminal__cursor', terminal);
    lines.forEach((line) => line.classList.add('is-pending'));

    await sleep(350);
    for (const line of lines) {
      line.classList.remove('is-pending');
      const command = qs('.terminal__cmd', line);
      if (command) {
        const text = command.textContent ?? '';
        command.textContent = '';
        if (cursor) line.appendChild(cursor);
        for (const character of text) {
          command.textContent += character;
          await sleep(45);
        }
        await sleep(300);
      } else {
        await sleep(160);
      }
    }
    // Le curseur finit sur la dernière ligne, comme dans le HTML d’origine.
    const last = lines[lines.length - 1];
    if (cursor && last) last.appendChild(cursor);
  }

  /* ---------- Captures : affichées seulement si l’image existe ---------- */
  function initShots() {
    qsa('.shot').forEach((shot) => {
      const img = qs('.shot__img', shot);
      if (!img) return;
      const onLoad = () => { shot.classList.add('is-loaded'); shot.disabled = false; };
      const onError = () => img.remove();
      if (img.complete) {
        if (img.naturalWidth > 0) onLoad(); else onError();
      } else {
        img.addEventListener('load', onLoad, { once: true });
        img.addEventListener('error', onError, { once: true });
      }
    });
  }

  /* ---------- Filtres des projets ---------- */
  function initFilters() {
    const buttons = qsa('.filter');
    const projects = qsa('.project');
    const count = qs('#count');
    if (!buttons.length) return;

    const apply = (filter) => {
      let visible = 0;
      projects.forEach((project) => {
        const categories = (project.dataset.cat ?? '').split(' ');
        const show = filter === 'all' || categories.includes(filter);
        project.hidden = !show;
        if (show) visible += 1;
      });
      if (count) {
        count.textContent = `${visible} projet${visible > 1 ? 's' : ''} affiché${visible > 1 ? 's' : ''}`;
      }
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
        apply(button.dataset.filter ?? 'all');
      });
    });
  }

  /* ---------- Capture agrandie (élément <dialog> natif) ---------- */
  function initLightbox() {
    const dialog = qs('#lightbox');
    if (!(dialog instanceof HTMLDialogElement) || typeof dialog.showModal !== 'function') return;

    const image = qs('.lightbox__img', dialog);
    const caption = qs('.lightbox__caption', dialog);
    const closeButton = qs('.lightbox__close', dialog);
    if (!image || !caption || !closeButton) return;

    let opener = null;

    const open = (source, trigger) => {
      // Sécurité : on n’affiche que des images servies par le site lui-même.
      const url = new URL(source.currentSrc || source.src, window.location.href);
      if (url.origin !== window.location.origin) return;
      image.src = url.href;
      image.alt = source.alt;
      caption.textContent = source.alt;
      opener = trigger;
      dialog.showModal();
    };

    qsa('.shot').forEach((shot) => {
      shot.addEventListener('click', () => {
        const img = qs('.shot__img', shot);
        if (img) open(img, shot);
      });
    });

    closeButton.addEventListener('click', () => dialog.close());
    // Un clic sur le fond sombre (l’élément <dialog> lui-même) ferme la fenêtre.
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      image.removeAttribute('src');
      if (opener) opener.focus();
    });
  }

  /* ---------- Réseau animé : on fige les paquets si l’utilisateur préfère moins de mouvement ---------- */
  function initTopology() {
    const svg = qs('.topology');
    if (!(svg instanceof SVGSVGElement)) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => (query.matches ? svg.pauseAnimations() : svg.unpauseAnimations());
    sync();
    query.addEventListener('change', sync);
  }

  /* ---------- Année du pied de page ---------- */
  function initYear() {
    const year = qs('#year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  const start = () => {
    initMenu();
    initActiveLink();
    initShots();
    initFilters();
    initLightbox();
    initYear();
    initTopology();
    initTerminal();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
