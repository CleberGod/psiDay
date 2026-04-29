/* =====================================================
   PsiDay - Scripts principais
   Etapa 11: Integração de melhorias do Teste sem Calendly
===================================================== */

const selectors = {
  mobileMenuButton: '#mobileMenuBtn',
  mainNav: '#mainNav',
  themeToggle: '#themeToggle',
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
  revealTargets: '.section, .footer',
};

const config = {
  whatsappNumber: '5511999999999',
  defaultWhatsappMessage: 'Olá, Dra. Dayane. Gostaria de agendar uma conversa inicial.',
};

const storageKeys = {
  theme: 'psiday-theme',
  fontScale: 'psiday-font-scale',
  cookiesAccepted: 'psiday-cookies-accepted',
};

const getElement = (selector) => document.querySelector(selector);

function setupMobileMenu() {
  const mobileMenuButton = getElement(selectors.mobileMenuButton);
  const mainNav = getElement(selectors.mainNav);

  if (!mobileMenuButton || !mainNav) return;

  const closeMenu = () => {
    mainNav.classList.remove('is-open');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    mobileMenuButton.setAttribute('aria-label', 'Abrir menu');
    mobileMenuButton.textContent = '☰';
  };

  const openMenu = () => {
    mainNav.classList.add('is-open');
    mobileMenuButton.setAttribute('aria-expanded', 'true');
    mobileMenuButton.setAttribute('aria-label', 'Fechar menu');
    mobileMenuButton.textContent = '×';
  };

  mobileMenuButton.addEventListener('click', () => {
    const isOpen = mainNav.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    const clickedInsideMenu = mainNav.contains(event.target);
    const clickedButton = mobileMenuButton.contains(event.target);
    if (!clickedInsideMenu && !clickedButton) closeMenu();
  });
}

function getPreferredTheme() {
  const savedTheme = localStorage.getItem(storageKeys.theme);

  if (savedTheme === 'dark' || savedTheme === 'light') {
    return savedTheme;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function applyTheme(theme) {
  const themeToggle = getElement(selectors.themeToggle);
  const isDark = theme === 'dark';

  document.body.dataset.theme = theme;

  if (!themeToggle) return;

  themeToggle.setAttribute('aria-label', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
  themeToggle.setAttribute('title', isDark ? 'Ativar modo claro' : 'Ativar modo escuro');
  themeToggle.querySelector('.theme-toggle-icon').textContent = isDark ? '☀️' : '🌙';
}

function setupThemeToggle() {
  const themeToggle = getElement(selectors.themeToggle);
  if (!themeToggle) return;

  applyTheme(getPreferredTheme());

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.dataset.theme === 'dark' ? 'dark' : 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';

    localStorage.setItem(storageKeys.theme, nextTheme);
    applyTheme(nextTheme);
  });
}


function buildWhatsappUrl(message = config.defaultWhatsappMessage) {
  const encodedMessage = encodeURIComponent(message.trim());
  return `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`;
}

function setupWhatsappLinks() {
  const whatsappLinks = document.querySelectorAll(selectors.whatsappLinks);
  if (!whatsappLinks.length) return;

  whatsappLinks.forEach((link) => {
    const message = link.dataset.message || config.defaultWhatsappMessage;
    link.setAttribute('href', buildWhatsappUrl(message));
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
}


function sanitizeText(value) {
  return value.replace(/\s+/g, ' ').trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function getFieldError(field) {
  const value = sanitizeText(field.value);
  const fieldName = field.name;

  if (field.type === 'checkbox' && field.required && !field.checked) {
    return 'Você precisa concordar com a Política de Privacidade para enviar.';
  }

  if (field.required && !value) {
    return 'Este campo é obrigatório.';
  }

  if (fieldName === 'nome' && value.length < 3) {
    return 'Informe um nome com pelo menos 3 caracteres.';
  }

  if (fieldName === 'email' && !isValidEmail(value)) {
    return 'Informe um e-mail válido.';
  }

  if (fieldName === 'telefone' && value) {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 13) {
      return 'Informe um WhatsApp válido ou deixe em branco.';
    }
  }

  if (fieldName === 'mensagem' && value.length < 10) {
    return 'Escreva uma mensagem com pelo menos 10 caracteres.';
  }

  return '';
}

function setFieldState(field, errorMessage = '') {
  const errorElement = document.querySelector(`[data-error-for="${field.name}"]`);

  const hasValue = field.type === 'checkbox' ? field.checked : Boolean(sanitizeText(field.value));

  field.classList.toggle('is-invalid', Boolean(errorMessage));
  field.classList.toggle('is-valid', !errorMessage && hasValue);

  if (errorElement) {
    errorElement.textContent = errorMessage;
  }
}

function showFormFeedback(type, message) {
  const feedback = getElement(selectors.formFeedback);
  if (!feedback) return;

  feedback.textContent = message;
  feedback.className = `form-feedback is-visible is-${type}`;
}

function clearFormFeedback() {
  const feedback = getElement(selectors.formFeedback);
  if (!feedback) return;

  feedback.textContent = '';
  feedback.className = 'form-feedback';
}

function updateMessageCounter() {
  const messageField = document.querySelector('[name="mensagem"]');
  const counter = getElement(selectors.messageCounter);

  if (!messageField || !counter) return;

  counter.textContent = messageField.value.length;
}

function setupContactFormValidation() {
  const form = getElement(selectors.contactForm);
  const submitButton = getElement(selectors.contactSubmitButton);

  if (!form || !submitButton) return;

  const fields = Array.from(form.querySelectorAll('input:not([type="hidden"]), textarea'));

  fields.forEach((field) => {
    field.addEventListener('input', () => {
      if (field.name === 'mensagem') updateMessageCounter();
      setFieldState(field, getFieldError(field));
      clearFormFeedback();
    });

    field.addEventListener('blur', () => {
      field.value = sanitizeText(field.value);
      setFieldState(field, getFieldError(field));
      if (field.name === 'mensagem') updateMessageCounter();
    });
  });

  updateMessageCounter();

  form.addEventListener('submit', (event) => {
    let hasError = false;

    fields.forEach((field) => {
      field.value = sanitizeText(field.value);
      const errorMessage = getFieldError(field);
      setFieldState(field, errorMessage);

      if (errorMessage) {
        hasError = true;
      }
    });

    if (hasError) {
      event.preventDefault();
      showFormFeedback('error', 'Revise os campos destacados antes de enviar.');
      const firstInvalidField = form.querySelector('.is-invalid');
      firstInvalidField?.focus();
      return;
    }

    showFormFeedback('success', 'Mensagem validada. Enviando com segurança...');
    submitButton.disabled = true;
    submitButton.classList.add('is-loading');
    submitButton.textContent = 'Enviando...';
  });
}

function setupBackToTop() {
  const backToTop = getElement(selectors.backToTop);
  if (!backToTop) return;

  const toggleVisibility = () => {
    const shouldShow = window.scrollY > 420;
    backToTop.classList.toggle('is-visible', shouldShow);
  };

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
}

function setupPrivacyModal() {
  const modal = getElement(selectors.privacyModal);
  const openButtons = document.querySelectorAll(selectors.openPrivacyButtons);
  const closeButtons = document.querySelectorAll(selectors.closePrivacyButtons);

  if (!modal || !openButtons.length) return;

  const openModal = () => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modal.querySelector(".privacy-modal__close")?.focus();
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  openButtons.forEach((button) => button.addEventListener("click", openModal));
  closeButtons.forEach((button) => button.addEventListener("click", closeModal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}


function applyFontScale(scale) {
  const normalizedScale = Math.min(Math.max(Number(scale) || 1, 0.9), 1.2);
  document.documentElement.style.setProperty('--font-scale', normalizedScale.toString());
  localStorage.setItem(storageKeys.fontScale, normalizedScale.toString());
}

function setupFontControls() {
  const increaseButton = getElement(selectors.increaseFont);
  const decreaseButton = getElement(selectors.decreaseFont);
  const resetButton = getElement(selectors.resetFont);

  if (!increaseButton || !decreaseButton || !resetButton) return;

  const savedScale = Number(localStorage.getItem(storageKeys.fontScale)) || 1;
  applyFontScale(savedScale);

  increaseButton.addEventListener('click', () => {
    const currentScale = Number(localStorage.getItem(storageKeys.fontScale)) || 1;
    applyFontScale(currentScale + 0.05);
  });

  decreaseButton.addEventListener('click', () => {
    const currentScale = Number(localStorage.getItem(storageKeys.fontScale)) || 1;
    applyFontScale(currentScale - 0.05);
  });

  resetButton.addEventListener('click', () => {
    applyFontScale(1);
  });
}


function setupFaqAccordion() {
  const questions = document.querySelectorAll(selectors.faqQuestions);
  if (!questions.length) return;

  questions.forEach((question) => {
    const answerId = question.getAttribute('aria-controls');
    const answer = answerId ? document.getElementById(answerId) : null;

    if (!answer) return;

    question.addEventListener('click', () => {
      const isExpanded = question.getAttribute('aria-expanded') === 'true';

      questions.forEach((otherQuestion) => {
        const otherAnswerId = otherQuestion.getAttribute('aria-controls');
        const otherAnswer = otherAnswerId ? document.getElementById(otherAnswerId) : null;

        otherQuestion.setAttribute('aria-expanded', 'false');
        if (otherAnswer) otherAnswer.hidden = true;
      });

      question.setAttribute('aria-expanded', String(!isExpanded));
      answer.hidden = isExpanded;
    });
  });
}


function setupCookieConsent() {
  const cookieConsent = getElement(selectors.cookieConsent);
  const acceptCookies = getElement(selectors.acceptCookies);
  if (!cookieConsent || !acceptCookies) return;
  const wasAccepted = localStorage.getItem(storageKeys.cookiesAccepted) === 'true';
  if (!wasAccepted) {
    window.setTimeout(() => {
      cookieConsent.classList.add('is-visible');
      cookieConsent.setAttribute('aria-hidden', 'false');
    }, 700);
  }
  acceptCookies.addEventListener('click', () => {
    localStorage.setItem(storageKeys.cookiesAccepted, 'true');
    cookieConsent.classList.remove('is-visible');
    cookieConsent.setAttribute('aria-hidden', 'true');
  });
}

function setupScrollReveal() {
  const targets = document.querySelectorAll(selectors.revealTargets);
  if (!targets.length) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;
  targets.forEach((target) => target.classList.add('reveal-target'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -80px 0px' });
  targets.forEach((target) => observer.observe(target));
}

function init() {
  setupMobileMenu();
  setupThemeToggle();
  setupFontControls();
  setupBackToTop();
  setupWhatsappLinks();
  setupContactFormValidation();
  setupPrivacyModal();
  setupFaqAccordion();
  setupCookieConsent();
  setupScrollReveal();
}

document.addEventListener('DOMContentLoaded', init);
