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

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const company = String(data.get('company') || '').trim();
  const process = String(data.get('process') || '').trim();
  const subject = encodeURIComponent(`Пилот AI Automation Studio — ${company || name}`);
  const body = encodeURIComponent(`Здравствуйте!\n\nХочу обсудить процесс для пилота.\n\nИмя: ${name}\nEmail: ${email}\nКомпания / роль: ${company || '—'}\n\nПроцесс:\n${process}\n`);
  status.textContent = 'Открываем письмо — останется только нажать «Отправить».';
  window.location.href = `mailto:valeriugvschool@gmail.com?subject=${subject}&body=${body}`;
});
