/**
 * Единый JavaScript сайта «Вита».
 *
 * Карта файла для разработчиков:
 * 1. [ОБЩЕЕ] Компоненты, работающие на главной и странице услуги.
 * 2. [УСЛУГА] Поведение, которое включается только при наличии блоков услуги.
 *
 * Каждый модуль изолирован и завершается раньше, если его разметки нет на странице.
 */

// [ОБЩЕЕ] Локальные формы без отправки страницы
document.querySelectorAll('[data-local-form]').forEach(function (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
  });
});

// [ОБЩЕЕ] На телефонах объёмные блоки открываются по заголовку
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

// [ОБЩЕЕ] Единая инициализация горизонтальных каруселей
(function () {
  if (typeof window.Swiper !== 'function') return;

  document.querySelectorAll('[data-content-carousel]').forEach(function (carousel) {
    var viewport = carousel.querySelector('[data-content-carousel-viewport]');
    if (!viewport) return;

    // [ОБЪЕДИНЕНО] Одна таблица размеров обслуживает все типы каруселей.
    // Для нового варианта достаточно добавить класс, набор значений и выбор типа ниже.
    var slideCounts = {
      standard: [1.3, 1.7, 2.2, 3.25, 4.35],
      wide: [1.08, 1.35, 1.8, 2.4, 3],
      video: [1.05, 1.08, 1.15, 1.35, 1.55],
      review: [1.05, 1.12, 1.45, 1.9, 2.25],
      staff: [1.3, 1.7, 2.2, 3, 4]
    };
    var carouselType = carousel.classList.contains('staff-carousel') ? 'staff' :
      carousel.classList.contains('content-carousel--review-cards') ? 'review' :
        carousel.classList.contains('content-carousel--video') ? 'video' :
          carousel.classList.contains('content-carousel--wide-cards') ? 'wide' : 'standard';
    var counts = slideCounts[carouselType];

    new window.Swiper(viewport, {
      slidesPerView: counts[0],
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
          slidesPerView: counts[1]
        },
        640: {
          slidesPerView: counts[2]
        },
        900: {
          slidesPerView: counts[3],
          spaceBetween: 20
        },
        1200: {
          slidesPerView: counts[4],
          spaceBetween: 20
        }
      }
    });
    carousel.classList.add('content-carousel--initialized');
  });
})();

// [ОБЩЕЕ] Просмотр рукописных отзывов в общем модальном окне
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

// [ОБЩЕЕ] Запуск видео из превью без блокировки свайпа по карточкам
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

// [ОБЩЕЕ] Попап с примером меню
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

// [ОБЩЕЕ] Попапы с маршрутами до филиалов
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

// [ОБЩЕЕ] Квиз подбора уровня ухода
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

// [ОБЩЕЕ] Предварительный расчёт стоимости
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

// ============================================================================
// [УСЛУГА] Модули страницы услуги
// ============================================================================

// [УСЛУГА] Содержание: свёрнуто до 900 px и раскрыто на десктопе
(function () {
  var toc = document.querySelector('.toc-block');
  if (!toc) return;

  var desktopMedia = window.matchMedia('(min-width: 901px)');
  var applyTocMode = function (event) {
    toc.toggleAttribute('open', event.matches);
  };

  applyTocMode(desktopMedia);
  if (typeof desktopMedia.addEventListener === 'function') {
    desktopMedia.addEventListener('change', applyTocMode);
  } else if (typeof desktopMedia.addListener === 'function') {
    desktopMedia.addListener(applyTocMode);
  }
})();

// [УСЛУГА] Распорядок дня: выделение текущего пункта по московскому времени
(function () {
  var scheduleItems = Array.from(document.querySelectorAll('.schedule-item time'));
  if (!scheduleItems.length) return;

  var moscowNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
  var currentMinutes = moscowNow.getHours() * 60 + moscowNow.getMinutes();
  var activeItem = null;

  scheduleItems.forEach(function (timeElement) {
    var timeParts = timeElement.getAttribute('datetime').split(':').map(Number);
    var itemMinutes = timeParts[0] * 60 + timeParts[1];
    if (itemMinutes <= currentMinutes) {
      activeItem = timeElement.closest('.schedule-item');
    }
  });

  if (!activeItem) {
    activeItem = scheduleItems[0].closest('.schedule-item');
  }

  activeItem.classList.add('schedule-item--current');
  var timeBox = activeItem.querySelector('.schedule-time');
  if (!timeBox || timeBox.querySelector('.schedule-current-label')) return;

  var label = document.createElement('span');
  label.className = 'schedule-current-label';
  label.textContent = 'сейчас';
  timeBox.appendChild(label);
})();
