// ===== Nav height sync =====
// Keeps --nav-h in sync with the sticky nav's real rendered height, so
// section scroll-margin-top always clears it exactly — on any viewport
// size and after font/logo load, without hardcoded per-breakpoint values.
const rootEl = document.documentElement;
const navEl = document.querySelector('.nav');

function syncNavHeight() {
  rootEl.style.setProperty('--nav-h', `${navEl.offsetHeight}px`);
}

syncNavHeight();
window.addEventListener('load', syncNavHeight);
window.addEventListener('resize', syncNavHeight);

if ('ResizeObserver' in window) {
  new ResizeObserver(syncNavHeight).observe(navEl);
}

// ===== Nav hide on scroll down / show on scroll up =====
const navLinksEl = document.getElementById('navLinks');
let lastScrollY = window.scrollY;
let navTicking = false;

function updateNavVisibility() {
  const currentY = window.scrollY;
  const scrolledPastNav = currentY > navEl.offsetHeight;
  const scrollingDown = currentY > lastScrollY;

  if (navLinksEl.classList.contains('open')) {
    // keep the nav visible while the mobile menu is open
  } else if (scrollingDown && scrolledPastNav) {
    navEl.classList.add('nav-hidden');
  } else {
    navEl.classList.remove('nav-hidden');
  }

  lastScrollY = currentY;
  navTicking = false;
}

window.addEventListener('scroll', () => {
  if (!navTicking) {
    requestAnimationFrame(updateNavVisibility);
    navTicking = true;
  }
}, { passive: true });

// ===== Mobile menu toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Terminal boot animation =====
const terminalBody = document.getElementById('terminalBody');

const bootLines = [
  { text: '$ whoami', cls: '' },
  { text: 'twinkle', cls: 'line-muted' },
  { text: '$ cat philosophy.txt', cls: '' },
  { text: 'build first, understand deeply, repeat', cls: 'line-amber' },
  { text: '$ ./ship.sh', cls: '' },
  { text: '[ok] still building, still learning', cls: 'line-muted' },
];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function typeLine(lineIndex) {
  if (lineIndex >= bootLines.length) {
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    terminalBody.appendChild(cursor);
    return;
  }
  const { text, cls } = bootLines[lineIndex];
  const lineEl = document.createElement('div');
  if (cls) lineEl.className = cls;
  terminalBody.appendChild(lineEl);

  if (prefersReducedMotion) {
    lineEl.textContent = text;
    typeLine(lineIndex + 1);
    return;
  }

  let charIndex = 0;
  const speed = text.startsWith('$') ? 45 : 18;
  function typeChar() {
    if (charIndex <= text.length) {
      lineEl.textContent = text.slice(0, charIndex);
      charIndex++;
      setTimeout(typeChar, speed);
    } else {
      setTimeout(() => typeLine(lineIndex + 1), 220);
    }
  }
  typeChar();
}
typeLine(0);

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll('.reveal');

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));
}
