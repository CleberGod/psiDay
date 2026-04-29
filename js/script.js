const selectors = {
  mobileMenuButton: '#mobileMenuBtn',
  mainNav: '#mainNav',
  backToTop: '#backToTop',
  whatsappLinks: '.js-whatsapp-link',
  contactForm: '#contactForm',
  formFeedback: '#formFeedback',
  contactSubmitButton: '#contactSubmitButton',
  messageCounter: '#messageCounter',
  privacyModal: '#privacyModal',
  openPrivacyButtons: '.js-open-privacy',
  closePrivacyButtons: '.js-close-privacy',
  increaseFont: '#increaseFont',
  decreaseFont: '#decreaseFont',
  resetFont: '#resetFont',
  faqQuestions: '.faq-question',
  cookieConsent: '#cookieConsent',
  acceptCookies: '#acceptCookies',
};

const config = {
  whatsappNumber: '5543984442427',
  defaultWhatsappMessage: 'Olá, Dra. Dayane. Gostaria de agendar uma consulta.',
};

const storageKeys = {
  fontScale: 'psiday-font-scale',
  cookiesAccepted: 'psiday-cookies-accepted',
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function setupWhatsappLinks() {
  $$(selectors.whatsappLinks).forEach((link) => {
    const message = link.dataset.message || config.defaultWhatsappMessage;
    link.href = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message.trim())}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });
}

function setupMobileMenu() {
  const button = $(selectors.mobileMenuButton);
  const nav = $(selectors.mainNav);
  if (!button || !nav) return;

  const closeMenu = () => {
    nav.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    button.textContent = '☰';
  };

  button.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
    button.textContent = isOpen ? '×' : '☰';
  });

  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}

function applyFontScale(scale) {
  const normalized = Math.min(Math.max(Number(scale) || 1, 0.9), 1.2);
  document.documentElement.style.setProperty('--font-scale', normalized.toString());
  localStorage.setItem(storageKeys.fontScale, normalized.toString());
}

function setupFontControls() {
  const increase = $(selectors.increaseFont);
  const decrease = $(selectors.decreaseFont);
  const reset = $(selectors.resetFont);
  if (!increase || !decrease || !reset) return;

  applyFontScale(localStorage.getItem(storageKeys.fontScale) || 1);

  increase.addEventListener('click', () => applyFontScale((Number(localStorage.getItem(storageKeys.fontScale)) || 1) + 0.05));
  decrease.addEventListener('click', () => applyFontScale((Number(localStorage.getItem(storageKeys.fontScale)) || 1) - 0.05));
  reset.addEventListener('click', () => applyFontScale(1));
}

function sanitize(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function getFieldError(field) {
  const value = sanitize(field.value || '');

  if (field.type === 'checkbox' && field.required && !field.checked) {
    return 'Você precisa concordar com a Política de Privacidade.';
  }
  if (field.required && !value) return 'Este campo é obrigatório.';
  if (field.name === 'nome' && value.length < 3) return 'Informe um nome com pelo menos 3 caracteres.';
  if (field.name === 'email' && !isValidEmail(value)) return 'Informe um e-mail válido.';
  if (field.name === 'telefone' && value) {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) return 'Informe um WhatsApp válido ou deixe em branco.';
  }
  if (field.name === 'mensagem' && value.length < 10) return 'Escreva uma mensagem com pelo menos 10 caracteres.';
  return '';
}

function setFieldState(field, message) {
  const error = document.querySelector(`[data-error-for="${field.name}"]`);
  field.classList.toggle('is-invalid', Boolean(message));
  if (error) error.textContent = message;
}

function setupContactForm() {
  const form = $(selectors.contactForm);
  const submitButton = $(selectors.contactSubmitButton);
  const feedback = $(selectors.formFeedback);
  const counter = $(selectors.messageCounter);
  if (!form || !submitButton) return;

  const fields = Array.from(form.querySelectorAll('input:not([type="hidden"]), textarea'));
  const messageField = form.querySelector('[name="mensagem"]');

  const updateCounter = () => {
    if (counter && messageField) counter.textContent = messageField.value.length;
  };

  fields.forEach((field) => {
    field.addEventListener('input', () => {
      setFieldState(field, getFieldError(field));
      updateCounter();
      if (feedback) {
        feedback.textContent = '';
        feedback.className = 'form-feedback';
      }
    });

    field.addEventListener('blur', () => {
      if (field.type !== 'checkbox') field.value = sanitize(field.value);
      setFieldState(field, getFieldError(field));
      updateCounter();
    });
  });

  updateCounter();

  form.addEventListener('submit', (event) => {
    let hasError = false;

    fields.forEach((field) => {
      if (field.type !== 'checkbox') field.value = sanitize(field.value);
      const error = getFieldError(field);
      setFieldState(field, error);
      if (error) hasError = true;
    });

    if (hasError) {
      event.preventDefault();
      if (feedback) {
        feedback.textContent = 'Revise os campos destacados antes de enviar.';
        feedback.className = 'form-feedback is-error';
      }
      form.querySelector('.is-invalid')?.focus();
      return;
    }

    if (feedback) {
      feedback.textContent = 'Mensagem validada. Enviando...';
      feedback.className = 'form-feedback is-success';
    }
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';
  });
}

function setupPrivacyModal() {
  const modal = $(selectors.privacyModal);
  if (!modal) return;

  const openModal = () => {
    modal.hidden = false;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modal.querySelector('.privacy-modal__close')?.focus();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modal.hidden = true;
  };

  $$(selectors.openPrivacyButtons).forEach((button) => button.addEventListener('click', openModal));
  $$(selectors.closePrivacyButtons).forEach((button) => button.addEventListener('click', closeModal));

  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
}

function setupFaq() {
  $$(selectors.faqQuestions).forEach((button) => {
    button.addEventListener('click', () => {
      const answer = button.nextElementSibling;
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      if (answer) answer.hidden = expanded;
    });
  });
}

function setupCookieConsent() {
  const banner = $(selectors.cookieConsent);
  const accept = $(selectors.acceptCookies);
  if (!banner || !accept) return;

  if (localStorage.getItem(storageKeys.cookiesAccepted) !== 'true') banner.hidden = false;

  accept.addEventListener('click', () => {
    localStorage.setItem(storageKeys.cookiesAccepted, 'true');
    banner.hidden = true;
  });
}

function setupBackToTop() {
  const button = $(selectors.backToTop);
  if (!button) return;

  const toggle = () => button.classList.toggle('is-visible', window.scrollY > 420);
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

function setupAboutPhotoModal() {
  const openButton = document.getElementById("openAboutModal");
  const modal = document.getElementById("aboutPhotoModal");
  const closeButton = document.getElementById("closeAboutModal");

  if (!openButton || !modal || !closeButton) return;

  const openModal = () => {
    modal.hidden = false;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    closeButton.focus();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    modal.hidden = true;
    openButton.focus();
  };

  openButton.addEventListener("click", openModal);
  closeButton.addEventListener("click", closeModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

function setupHeroCarousel() {
  const carousel = document.getElementById('heroCarousel');
  const images = document.querySelectorAll('.carousel-image');
  const dots = document.querySelectorAll('.carousel-dots .dot');

  if (!carousel || !images.length) return;

  let index = 0;
  let interval;
  let touchStartX = 0;
  let touchEndX = 0;

  function showSlide(nextIndex) {
    index = nextIndex;

    images.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  function nextSlide() {
    showSlide((index + 1) % images.length);
  }

  function previousSlide() {
    showSlide((index - 1 + images.length) % images.length);
  }

  function startCarousel() {
    stopCarousel();
    interval = setInterval(nextSlide, 6000);
  }

  function stopCarousel() {
    clearInterval(interval);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showSlide(i);
      startCarousel();
    });
  });

  carousel.addEventListener('mouseenter', stopCarousel);
  carousel.addEventListener('mouseleave', startCarousel);
  carousel.addEventListener('focusin', stopCarousel);
  carousel.addEventListener('focusout', startCarousel);

  carousel.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
    stopCarousel();
  }, { passive: true });

  carousel.addEventListener('touchend', (event) => {
    touchEndX = event.changedTouches[0].screenX;

    const swipeDistance = touchStartX - touchEndX;
    const minimumSwipeDistance = 50;

    if (swipeDistance > minimumSwipeDistance) {
      nextSlide();
    }

    if (swipeDistance < -minimumSwipeDistance) {
      previousSlide();
    }

    startCarousel();
  }, { passive: true });

  showSlide(0);
  startCarousel();
}

function init() {
  setupWhatsappLinks();
  setupMobileMenu();
  setupFontControls();
  setupContactForm();
  setupPrivacyModal();
  setupFaq();
  setupCookieConsent();
  setupBackToTop();
  setupAboutPhotoModal();
  setupHeroCarousel();
}

document.addEventListener('DOMContentLoaded', init);
