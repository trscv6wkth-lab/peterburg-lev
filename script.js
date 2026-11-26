const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('#site-nav');

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
  siteNav.classList.toggle('open', !isOpen);
});

siteNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Открыть меню');
    siteNav.classList.remove('open');
  });
});

document.querySelectorAll('.quiz-option').forEach((button) => {
  button.addEventListener('click', () => {
    const options = document.querySelectorAll('.quiz-option');
    const result = document.querySelector('.quiz-result');
    options.forEach((option) => option.classList.remove('correct', 'incorrect'));
    if (button.dataset.answer === 'true') {
      button.classList.add('correct');
      result.textContent = 'Верно! Крепость заложили на Заячьем острове.';
    } else {
      button.classList.add('incorrect');
      result.textContent = 'Попробуй ещё раз — подсказка есть в разделе «История».';
    }
  });
});
