// Локальные формы без отправки страницы
document.querySelectorAll('[data-local-form]').forEach(function (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
  });
});

// На телефонах объёмные блоки открываются по заголовку.
(function () {
  var media = window.matchMedia('(max-width: 640px)');
  var blocks = document.querySelectorAll('[data-mobile-collapsible]');
  if (!blocks.length) return;

  function setExpanded(block, expanded) {
    block.classList.toggle('is-expanded', expanded);
    var toggle = block.querySelector('[data-mobile-toggle]');
    if (toggle) {
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
  }

  blocks.forEach(function (block) {
    var toggle = block.querySelector('[data-mobile-toggle]');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      if (!media.matches) return;
      setExpanded(block, !block.classList.contains('is-expanded'));
    });
  });

  function applyMode() {
    blocks.forEach(function (block) {
      setExpanded(block, !media.matches);
    });
  }

  applyMode();
  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', applyMode);
  } else if (typeof media.addListener === 'function') {
    media.addListener(applyMode);
  }
})();

// Единая инициализация горизонтальных каруселей
(function () {
  if (typeof window.Swiper !== 'function') return;

  document.querySelectorAll('[data-content-carousel]').forEach(function (carousel) {
    var viewport = carousel.querySelector('[data-content-carousel-viewport]');
    if (!viewport) return;

    var hasWideCards = carousel.classList.contains('content-carousel--wide-cards');
    var hasVideoCards = carousel.classList.contains('content-carousel--video');
    var hasReviewCards = carousel.classList.contains('content-carousel--review-cards');

    new window.Swiper(viewport, {
      slidesPerView: hasReviewCards ? 1.05 : (hasVideoCards ? 1.05 : (hasWideCards ? 1.08 : 1.3)),
      spaceBetween: 16,
      // Правило проекта для всех текущих и новых каруселей:
      // без бесшовного loop и дублированных карточек; после последней позиции
      // следующая прокрутка возвращает ленту к первой, а с первой назад — к последней.
      loop: false,
      rewind: true,
      keyboard: {
        enabled: true,
        onlyInViewport: true
      },
      navigation: {
        prevEl: carousel.querySelector('[data-content-carousel-prev]'),
        nextEl: carousel.querySelector('[data-content-carousel-next]')
      },
      pagination: {
        el: carousel.querySelector('[data-content-carousel-pagination]'),
        clickable: true
      },
      breakpoints: {
        480: {
          slidesPerView: hasReviewCards ? 1.12 : (hasVideoCards ? 1.08 : (hasWideCards ? 1.35 : 1.7))
        },
        640: {
          slidesPerView: hasReviewCards ? 1.45 : (hasVideoCards ? 1.15 : (hasWideCards ? 1.8 : 2.2))
        },
        900: {
          slidesPerView: hasReviewCards ? 1.9 : (hasVideoCards ? 1.35 : (hasWideCards ? 2.4 : 3.25)),
          spaceBetween: 20
        },
        1200: {
          slidesPerView: hasReviewCards ? 2.25 : (hasVideoCards ? 1.55 : (hasWideCards ? 3 : 4.35)),
          spaceBetween: 20
        }
      }
    });
    carousel.classList.add('content-carousel--initialized');
  });
})();

// Просмотр рукописных отзывов в общем модальном окне
(function () {
  var dialog = document.getElementById('review-photo-dialog');
  if (!dialog) return;

  var image = dialog.querySelector('img');
  var closeButton = dialog.querySelector('.review-photo-dialog__close');

  document.querySelectorAll('[data-review-image]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (image) image.src = button.getAttribute('data-review-image') || './img/otzyv.webp';
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', function () {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    });
  }

  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  });
})();

// Запуск видео из превью без блокировки свайпа по карточкам
(function () {
  document.querySelectorAll('[data-video-play]').forEach(function (button) {
    button.addEventListener('click', function () {
      var media = button.closest('.video-card__media');
      var source = button.getAttribute('data-video-src');
      if (!media || !source) return;

      var iframe = document.createElement('iframe');
      iframe.src = source.replace('autoplay=0', 'autoplay=1');
      iframe.title = button.getAttribute('aria-label').replace('Воспроизвести видео: ', '');
      iframe.loading = 'lazy';
      iframe.allow = 'fullscreen; accelerometer; gyroscope; picture-in-picture; encrypted-media';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('scrolling', 'no');
      media.replaceChildren(iframe);
    });
  });
})();

// Попап с примером меню
(function () {
  var trigger = document.querySelector('[data-menu-popup]');
  var modal = document.querySelector('[data-menu-modal]');
  if (!trigger || !modal) return;

  var dialog = modal.querySelector('.menu-popup__dialog');
  var closeButtons = modal.querySelectorAll('[data-menu-close]');

  var openModal = function () {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    if (dialog) dialog.focus();
  };

  var closeModal = function () {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus();
  };

  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', openModal);

  closeButtons.forEach(function (button) {
    button.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
})();

// Попапы с маршрутами до филиалов
(function () {
  var triggers = document.querySelectorAll('[data-popup]');
  if (!triggers.length) return;

  var activeTrigger = null;
  var activeModal = null;

  var closeRouteModal = function () {
    if (!activeModal) return;
    activeModal.classList.remove('is-open');
    activeModal.setAttribute('aria-hidden', 'true');
    if (activeTrigger) {
      activeTrigger.setAttribute('aria-expanded', 'false');
      activeTrigger.focus();
    }
    activeTrigger = null;
    activeModal = null;
  };

  triggers.forEach(function (trigger) {
    var routeId = trigger.getAttribute('data-popup');
    var modal = document.querySelector('[data-route-modal="' + routeId + '"]');
    if (!modal) return;

    var dialog = modal.querySelector('.route-popup__dialog');
    var closeButtons = modal.querySelectorAll('[data-route-close]');

    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', function () {
      if (activeModal && activeModal !== modal) closeRouteModal();
      activeTrigger = trigger;
      activeModal = modal;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
      if (dialog) dialog.focus();
    });

    closeButtons.forEach(function (button) {
      button.addEventListener('click', closeRouteModal);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeRouteModal();
  });
})();

// Квиз подбора уровня ухода
(function () {
  var triggers = document.querySelectorAll('[data-quiz-open]');
  var modal = document.querySelector('[data-quiz-modal]');
  if (!triggers.length || !modal) return;

  var dialog = modal.querySelector('.quiz-popup__dialog');
  var form = modal.querySelector('[data-quiz-form]');
  var result = modal.querySelector('[data-quiz-result]');
  var activeTrigger = null;

  var openQuiz = function (trigger) {
    activeTrigger = trigger;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    if (dialog) dialog.focus();
  };

  var closeQuiz = function () {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    if (activeTrigger) {
      activeTrigger.setAttribute('aria-expanded', 'false');
      activeTrigger.focus();
    }
    activeTrigger = null;
  };

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () { openQuiz(trigger); });
  });

  modal.querySelectorAll('[data-quiz-close]').forEach(function (button) {
    button.addEventListener('click', closeQuiz);
  });

  if (form && result) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var score = Array.from(new FormData(form).values()).reduce(function (sum, value) {
        return sum + Number(value);
      }, 0);
      var tariff = score >= 5 ? 'усиленный уход' : score >= 2 ? 'стандартный уход' : 'базовый уход';
      result.hidden = false;
      result.innerHTML = '<strong>Предварительно подойдёт: ' + tariff + '.</strong>' +
        '<span>Точный формат определит специалист после уточнения состояния и пожеланий семьи.</span>' +
        '<a class="btn" href="#form">Получить консультацию</a>';
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeQuiz();
  });
})();

// Предварительный расчёт стоимости
(function () {
  var calculator = document.querySelector('.calculator-wrap');
  var output = document.getElementById('calc-result');
  if (!calculator || !output) return;

  var calculate = function () {
    var state = document.getElementById('calc-state');
    var days = document.getElementById('calc-days');
    var room = document.getElementById('calc-room');
    if (!state || !days || !room) return;

    var stateRates = [1900, 2200, 2500, 2500];
    var roomExtra = [0, 250, 650];
    var selectedMobility = calculator.querySelector('input[name="mob"]:checked');
    var mobilityExtra = selectedMobility && selectedMobility.value === 'bedridden' ? 250 : 0;
    var dailyRate = stateRates[state.selectedIndex] + roomExtra[room.selectedIndex] + mobilityExtra;
    var total = dailyRate * Math.max(1, Number(days.value) || 1);
    output.innerHTML = 'от ' + total.toLocaleString('ru-RU') + ' ₽ <small>/ период</small>';
  };

  calculator.addEventListener('input', calculate);
  calculator.addEventListener('change', calculate);
  calculator.addEventListener('submit', function (event) {
    event.preventDefault();
    calculate();
  });
  calculate();
})();
