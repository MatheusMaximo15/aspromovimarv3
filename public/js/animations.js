// ============================================
// MAGIC UI - Sistema de Animações
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initSpotlightEffect();
  initTilt3D();
  initParallax();
  initSmoothScroll();
});

// Scroll Reveal Animation
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });
}

// Efeito de Spotlight que segue o mouse
function initSpotlightEffect() {
  const spotlightElements = document.querySelectorAll('.spotlight');

  spotlightElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      el.style.setProperty('--mouse-x', `${x}%`);
      el.style.setProperty('--mouse-y', `${y}%`);
    });
  });
}

// Efeito 3D Tilt nos cards
function initTilt3D() {
  const tiltElements = document.querySelectorAll('.tilt-3d');

  tiltElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Ângulo mais suave para não "jogar" o card tão para trás
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      el.style.setProperty('--rotate-x', `${rotateX}deg`);
      el.style.setProperty('--rotate-y', `${rotateY}deg`);
    });

    el.addEventListener('mouseleave', () => {
      el.style.setProperty('--rotate-x', '0deg');
      el.style.setProperty('--rotate-y', '0deg');
    });
  });
}

// Efeito Parallax suave
function initParallax() {
  const parallaxElements = document.querySelectorAll('.parallax');

  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    parallaxElements.forEach((el, index) => {
      const speed = el.dataset.speed || 0.5;
      const yPos = -(scrolled * speed);
      el.style.transform = `translateY(${yPos}px)`;
    });
  });
}

// Smooth Scroll para links âncora
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');

      // Ignora se for só "#"
      if (href === '#') return;

      e.preventDefault();

      const target = document.querySelector(href);
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Função auxiliar para adicionar animação em sequência
function staggerAnimation(elements, animationClass, delay = 100) {
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add(animationClass);
    }, index * delay);
  });
}

// Contador animado para números
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// Observador de visibilidade para contadores
function initCounters() {
  const counters = document.querySelectorAll('[data-counter]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        const target = parseInt(entry.target.dataset.counter);
        animateCounter(entry.target, target);
        entry.target.classList.add('counted');
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));
}

// Efeito de digitação (typewriter)
function typewriterEffect(element, text, speed = 50) {
  let i = 0;
  element.textContent = '';

  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  type();
}

// Adiciona classe de hover permanente em mobile
function initMobileHoverFix() {
  if ('ontouchstart' in window) {
    document.querySelectorAll('.card-hover, .btn-shimmer').forEach(el => {
      el.addEventListener('touchstart', function() {
        this.classList.add('touch-hover');
      });

      el.addEventListener('touchend', function() {
        setTimeout(() => {
          this.classList.remove('touch-hover');
        }, 300);
      });
    });
  }
}

// Lazy loading de imagens com efeito fade
function initLazyLoad() {
  const images = document.querySelectorAll('img[data-src]');

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('fade-in');
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

// Scroll Progress Bar
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    progressBar.style.width = `${scrolled}%`;
  });
}

// Inicializa funcionalidades adicionais
document.addEventListener('DOMContentLoaded', () => {
  initCounters();
  initMobileHoverFix();
  initLazyLoad();
  initScrollProgress();
});

// Exporta funções para uso global
window.MagicUI = {
  staggerAnimation,
  animateCounter,
  typewriterEffect
};
