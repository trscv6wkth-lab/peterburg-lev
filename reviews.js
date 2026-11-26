// Set this after publishing google-apps-script/Code.gs as a Web App.
const REVIEWS_API_URL = 'https://script.google.com/macros/s/AKfycbzuDErnO4PXZLddhLqIZouLArMLleyBie7RtjLUzKQt4JYpwSWqoMFLfh9dSiv_nzDr/exec';
const reviewStars = [...document.querySelectorAll('.review-star')];
const reviewRating = document.querySelector('#rating');

reviewStars.forEach((star) => star.addEventListener('click', () => {
  const rating = Number(star.dataset.rating);
  reviewRating.value = String(rating);
  reviewStars.forEach((item) => item.classList.toggle('selected', Number(item.dataset.rating) <= rating));
}));

function escapeReviewText(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

function renderReviews(items) {
  const list = document.querySelector('#reviews-list');
  if (!items.length) {
    list.innerHTML = '<p class="review-empty">Пока отзывов нет. Будь первым!</p>';
    return;
  }
  list.innerHTML = items.map((review) => {
    const rating = Math.max(1, Math.min(5, Number(review.rating) || 5));
    return '<article class="review-item"><div class="review-item-head"><strong>' + escapeReviewText(review.name) + '</strong>' +
      '<span class="review-item-stars" aria-label="Оценка: ' + rating + ' из 5">' + '★'.repeat(rating) + '☆'.repeat(5 - rating) + '</span></div>' +
      '<p>' + escapeReviewText(review.text) + '</p><time>' + escapeReviewText(review.date || '') + '</time></article>';
  }).join('');
}

const reviewForm = document.querySelector('#review-form');
const reviewFrame = document.querySelector('iframe[name="review-frame"]');
if (REVIEWS_API_URL.startsWith('https://script.google.com/macros/s/')) {
  const callbackName = 'renderReviews';
  const loader = document.createElement('script');
  loader.src = REVIEWS_API_URL + '?callback=' + callbackName + '&_=' + Date.now();
  loader.onerror = () => {
    document.querySelector('#reviews-list').innerHTML = '<p class="review-empty">Не получилось загрузить отзывы. Попробуй позже.</p>';
  };
  document.head.append(loader);

  let submitted = false;
  reviewFrame.addEventListener('load', () => {
    if (!submitted) return;
    const success = document.querySelector('#review-success');
    success.textContent = 'Спасибо! Отзыв отправлен и появится в списке после обновления страницы.';
    reviewForm.reset();
    reviewRating.value = '5';
    reviewStars.forEach((star) => star.classList.add('selected'));
    submitted = false;
  });
  reviewForm.addEventListener('submit', () => {
    const payload = {
      name: reviewForm.elements.name.value.trim(),
      rating: Number(reviewRating.value),
      text: reviewForm.elements.text.value.trim(),
      website: reviewForm.elements.website.value.trim()
    };
    document.querySelector('#review-payload').value = JSON.stringify(payload);
    reviewForm.action = REVIEWS_API_URL;
    document.querySelector('#review-success').textContent = '';
    submitted = true;
  });
} else {
  document.querySelector('#reviews-list').innerHTML = '<p class="review-empty">Форма подключается.</p>';
  reviewForm.addEventListener('submit', (event) => {
    event.preventDefault();
    document.querySelector('#review-success').textContent = 'Форма пока не подключена к Apps Script.';
  });
}
