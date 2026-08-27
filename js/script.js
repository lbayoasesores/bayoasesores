document.getElementById('year').textContent = new Date().getFullYear();

/* Capture UTM source (TikTok, Instagram, etc.) so leads can be traced back to the channel that sent them */
(function trackSource() {
  const params = new URLSearchParams(window.location.search);
  const incoming = {
    source: params.get('utm_source'),
    medium: params.get('utm_medium'),
    campaign: params.get('utm_campaign')
  };

  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem('bayo_utm') || '{}');
  } catch (e) { stored = {}; }

  if (incoming.source || incoming.medium || incoming.campaign) {
    stored = incoming;
    try { localStorage.setItem('bayo_utm', JSON.stringify(stored)); } catch (e) {}
  }

  const sourceField = document.getElementById('utm_source');
  const mediumField = document.getElementById('utm_medium');
  const campaignField = document.getElementById('utm_campaign');
  const referrerField = document.getElementById('pagina_referencia');

  if (sourceField) sourceField.value = stored.source || 'directo';
  if (mediumField) mediumField.value = stored.medium || '';
  if (campaignField) campaignField.value = stored.campaign || '';
  if (referrerField) referrerField.value = document.referrer || '';
})();

/* Mobile nav toggle */
const navToggle = document.getElementById('nav-toggle');
const header = document.querySelector('.site-header');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  document.querySelectorAll('.main-nav a').forEach(link => {
    link.addEventListener('click', () => {
      header.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* FAQ accordion */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    const answer = btn.nextElementSibling;

    document.querySelectorAll('.faq-question').forEach(other => {
      other.setAttribute('aria-expanded', 'false');
      other.nextElementSibling.style.maxHeight = null;
    });

    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      answer.style.maxHeight = answer.scrollHeight + 'px';
    }
  });
});

/* Savings calculator */
const billRange = document.getElementById('bill-range');
const billValue = document.getElementById('bill-value');
const savingMonthly = document.getElementById('saving-monthly');
const savingYearly = document.getElementById('saving-yearly');
const SAVING_RATE = 0.2;

function updateCalculator() {
  const bill = Number(billRange.value);
  const monthlySaving = Math.round(bill * SAVING_RATE);
  billValue.textContent = bill + '€';
  savingMonthly.textContent = monthlySaving + '€';
  savingYearly.textContent = (monthlySaving * 12) + '€';
}
if (billRange) {
  billRange.addEventListener('input', updateCalculator);
  updateCalculator();
}

/* Lead form submission via Formspree (AJAX so we can show an inline message) */
const leadForm = document.getElementById('lead-form');
const formNote = document.getElementById('form-note');
const submitBtn = document.getElementById('form-submit');

if (leadForm) {
  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (leadForm.action.includes('TU_ID_DE_FORMSPREE')) {
      formNote.textContent = 'Formulario en configuración: falta añadir el endpoint de Formspree en index.html.';
      formNote.className = 'form-note error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    formNote.textContent = '';
    formNote.className = 'form-note';

    try {
      const response = await fetch(leadForm.action, {
        method: 'POST',
        body: new FormData(leadForm),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        leadForm.reset();
        formNote.textContent = '¡Gracias! Hemos recibido tus datos, te contactaremos muy pronto.';
        formNote.className = 'form-note success';
      } else {
        formNote.textContent = 'No hemos podido enviar el formulario. Prueba de nuevo o escríbenos por WhatsApp.';
        formNote.className = 'form-note error';
      }
    } catch (err) {
      formNote.textContent = 'Error de conexión. Prueba de nuevo o escríbenos por WhatsApp.';
      formNote.className = 'form-note error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar y pedir mi estudio gratuito';
    }
  });
}
