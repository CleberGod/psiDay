document.addEventListener('DOMContentLoaded', () => {
  const whatsappNumber = '5511999999999';

  // Configura WhatsApp
  document.querySelectorAll('.js-whatsapp-link').forEach(link => {
    const message = link.dataset.message || '';
    link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    link.target = '_blank';
  });

  // Contagem regressiva
  let timeLeft = 15; // segundos
  const countdownElement = document.getElementById('countdown');

  const interval = setInterval(() => {
    timeLeft--;

    if (countdownElement) {
      countdownElement.textContent = timeLeft;
    }

    if (timeLeft <= 0) {
      clearInterval(interval);
      window.location.href = 'index.html';
    }
  }, 1000);
});