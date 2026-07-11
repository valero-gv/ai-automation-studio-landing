const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.nav');

menuButton?.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -35px' });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const form = document.querySelector('#contact-form');
const status = form?.querySelector('.form-status');
const submitButton = form?.querySelector('button[type="submit"]');
const defaultButtonLabel = submitButton?.innerHTML;

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.classList.remove('error');
  status.textContent = '';
  submitButton.disabled = true;
  submitButton.textContent = 'Отправляем…';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) throw new Error('Form submission failed');

    form.reset();
    status.textContent = 'Спасибо! Заявка отправлена. Мы ответим в течение двух рабочих дней.';
  } catch (error) {
    status.classList.add('error');
    status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или напишите на valeriugvschool@gmail.com.';
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = defaultButtonLabel;
  }
});
