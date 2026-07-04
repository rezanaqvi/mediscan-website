// ============================================================
// MediScan Landing Page — JavaScript
// ============================================================

// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile menu toggle
const mobileToggle = document.getElementById('mobileToggle');
const navLinks = document.getElementById('navLinks');
mobileToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
  });
});

// Feature tabs
const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active from all
    tabBtns.forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Activate clicked tab
    btn.classList.add('active');
    const tabId = 'tab-' + btn.dataset.tab;
    document.getElementById(tabId).classList.add('active');
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Apply fade-in to cards and sections
document.querySelectorAll('.problem-card, .feature-card, .flow-step, .demo-card, .tech-item, .market-card, .traction-item, .roadmap-item, .team-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// Stagger animation delays for grid items
document.querySelectorAll('.problem-grid, .features-grid, .tech-grid, .market-grid, .traction-grid, .demo-grid').forEach(grid => {
  Array.from(grid.children).forEach((child, i) => {
    child.style.transitionDelay = `${i * 0.1}s`;
  });
});

// Counter animation for stats
function animateCounter(el, target, suffix = '') {
  const duration = 1500;
  const start = performance.now();
  const startVal = 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(startVal + (target - startVal) * eased);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// Animate stats when hero is visible
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stats are rendered as text, so we just ensure they're visible
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statsObserver.observe(heroStats);
}

// Active nav link based on scroll position
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 100;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);

    if (navLink) {
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLink.style.color = 'var(--primary)';
      } else {
        navLink.style.color = '';
      }
    }
  });
});

// ============================================================
// Dynamic 3D layer — parallax organs, tilt, scroll reveals
// ============================================================

// Mouse / scroll parallax for the floating organs
(function () {
  const scene = document.getElementById('heroScene');
  if (!scene) return;
  const organs = Array.from(scene.querySelectorAll('.organ'));
  let mx = 0, my = 0, sy = 0;
  function apply() {
    organs.forEach((o) => {
      const d = parseFloat(o.dataset.depth || '2');
      o.style.transform = `translate3d(${mx * d}px, ${my * d + sy * d * 0.6}px, 0)`;
    });
  }
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 24;
    my = (e.clientY / window.innerHeight - 0.5) * 24;
    apply();
  }, { passive: true });
  window.addEventListener('scroll', () => {
    sy = Math.min(window.scrollY, 600) / 600 * -14;
    apply();
  }, { passive: true });
})();

// Initialise vanilla-tilt on tagged cards (respect reduced motion)
if (window.VanillaTilt && !matchMedia('(prefers-reduced-motion: reduce)').matches && matchMedia('(hover: hover)').matches) {
  VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
    speed: 500, glare: true, 'max-glare': 0.15, max: 8, scale: 1.02,
  });
}

// Richer 3D scroll reveal for section headers + rows
(function () {
  const targets = document.querySelectorAll('.section-header, .flow-container, .demo-cta, .cta-content, .roadmap-item');
  targets.forEach((t) => t.classList.add('reveal-3d'));
  const io = new IntersectionObserver((ents) => {
    ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  targets.forEach((t) => io.observe(t));
})();

// ============================================================
// Count-up stats (keeps prefix/suffix like $, M+, %, < , s)
// ============================================================
(function () {
  function countEl(el) {
    const raw = el.dataset.raw || el.textContent.trim();
    el.dataset.raw = raw;
    const m = raw.match(/-?\d[\d,]*\.?\d*/);
    if (!m) return;
    const numStr = m[0].replace(/,/g, '');
    const target = parseFloat(numStr);
    const decimals = (numStr.split('.')[1] || '').length;
    const pre = raw.slice(0, m.index);
    const suf = raw.slice(m.index + m[0].length);
    const dur = 1400, t0 = performance.now();
    function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = (target * eased).toFixed(decimals);
      el.textContent = pre + val + suf;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = raw;
    }
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver((ents) => {
    ents.forEach((en) => { if (en.isIntersecting) { countEl(en.target); io.unobserve(en.target); } });
  }, { threshold: 0.6 });
  document.querySelectorAll('.stat-number, .market-number').forEach((el) => io.observe(el));
})();

// ============================================================
// Solution QR-flow: sequential pop-in + pulsing scan accent
// ============================================================
(function () {
  const steps = document.querySelectorAll('.solution-flow .flow-step');
  if (!steps.length) return;
  steps.forEach((s, i) => {
    s.style.opacity = '0';
    s.style.transform = 'translateY(24px) scale(.96)';
    s.style.transition = `opacity .6s ease ${i * 0.18}s, transform .6s cubic-bezier(.2,.8,.2,1) ${i * 0.18}s`;
  });
  const io = new IntersectionObserver((ents) => {
    ents.forEach((en) => {
      if (en.isIntersecting) {
        steps.forEach((s) => { s.style.opacity = '1'; s.style.transform = 'none'; });
        io.disconnect();
      }
    });
  }, { threshold: 0.3 });
  io.observe(steps[0]);
})();
