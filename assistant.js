/* ============================================================
   Елена — колорист. Пошаговый AI-подбор услуги.
   ============================================================ */

(function () {
  'use strict';

  var app = document.getElementById('assistant-app');
  if (!app) {
    return;
  }

  var quiz = document.getElementById('assistant-quiz');
  var questionEl = document.getElementById('assistant-question');
  var optionsEl = document.getElementById('assistant-options');
  var nextBtn = document.getElementById('assistant-next');
  var backBtn = document.getElementById('assistant-back');
  var stepLabel = document.getElementById('assistant-step-label');
  var progress = app.querySelector('.assistant__progress');
  var progressBar = document.getElementById('assistant-progress-bar');
  var result = document.getElementById('assistant-result');
  var resultTitle = document.getElementById('assistant-result-title');
  var resultWhy = document.getElementById('assistant-result-why');
  var resultMeta = document.getElementById('assistant-result-meta');
  var resultImg = document.getElementById('assistant-result-img');
  var resultLink = document.getElementById('assistant-result-link');
  var restartBtn = document.getElementById('assistant-restart');

  if (!quiz || !questionEl || !optionsEl || !nextBtn || !backBtn || !stepLabel || !progress || !progressBar || !result || !resultTitle || !resultWhy || !resultMeta || !resultImg || !resultLink || !restartBtn) {
    return;
  }

  var questions = [
    {
      key: 'goal',
      text: 'Что хочется изменить?',
      options: [
        { value: 'refresh', label: 'Освежить оттенок' },
        { value: 'dimension', label: 'Добавить переход и объём' },
        { value: 'lighter', label: 'Стать светлее' },
        { value: 'shine', label: 'Вернуть блеск и мягкость' }
      ]
    },
    {
      key: 'hair',
      text: 'Какие волосы сейчас?',
      options: [
        { value: 'natural', label: 'Натуральные' },
        { value: 'dark', label: 'Окрашенные в тёмный' },
        { value: 'blonde', label: 'Уже блонд' },
        { value: 'damaged', label: 'Осветлённые, нужен уход' }
      ]
    },
    {
      key: 'time',
      text: 'Сколько времени готовы выделить?',
      options: [
        { value: 'short', label: 'До 2 часов' },
        { value: 'medium', label: '2–4 часа' },
        { value: 'long', label: '4–6 часов' }
      ]
    }
  ];

  var services = {
    balayage: {
      title: 'Балаяж',
      url: 'services/balayazh.html',
      img: 'images/gallery-1.jpg',
      alt: 'Тёплый балаяж на длинных волосах',
      time: '3–4 часа',
      price: 'от 5 000 ₽'
    },
    toning: {
      title: 'Тонирование',
      url: 'services/tonirovanie.html',
      img: 'images/gallery-2.jpg',
      alt: 'Мягкое тонирование в тёплый коричневый оттенок',
      time: '1,5–2 часа',
      price: 'от 3 000 ₽'
    },
    blond: {
      title: 'Блонд',
      url: 'services/blond.html',
      img: 'images/gallery-3.jpg',
      alt: 'Холодный блонд с плавным переходом',
      time: '4–5 часов',
      price: 'от 7 000 ₽'
    },
    care: {
      title: 'Уход и восстановление',
      url: 'services/uhod.html',
      img: 'images/gallery-4.jpg',
      alt: 'Уход за волосами в салоне',
      time: '1–1,5 часа',
      price: 'от 2 500 ₽'
    }
  };

  var reasons = {
    balayage: 'Вы хотите мягкий переход и объём — балаяж даст естественный контраст без резкой линии.',
    toning: 'Вам нужно освежить оттенок без глубокого вмешательства — тонирование быстро вернёт блеск и уберёт желтизну.',
    blond: 'Вы хотите стать светлее — подберём оттенок и план осветления под состояние волос.',
    care: 'Сначала стоит вернуть волосам плотность и блеск — уход восстановит структуру и подготовит к окрашиванию.'
  };

  var answers = {};
  var step = 0;

  function currentQuestion() {
    return questions[step];
  }

  function renderOptions() {
    var question = currentQuestion();

    questionEl.textContent = question.text;
    optionsEl.innerHTML = '';

    question.options.forEach(function (option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'assistant__option';
      button.textContent = option.label;
      button.setAttribute('aria-pressed', answers[question.key] === option.value ? 'true' : 'false');

      button.addEventListener('click', function () {
        answers[question.key] = option.value;
        Array.prototype.forEach.call(optionsEl.children, function (item, index) {
          item.setAttribute('aria-pressed', question.options[index].value === option.value ? 'true' : 'false');
        });
        nextBtn.disabled = false;
      });

      optionsEl.appendChild(button);
    });

    nextBtn.disabled = !answers[question.key];
    nextBtn.textContent = step === questions.length - 1 ? 'Показать результат' : 'Далее';
    backBtn.hidden = step === 0;
    stepLabel.textContent = 'Шаг ' + (step + 1) + ' из ' + questions.length;
    progress.setAttribute('aria-valuenow', String(step + 1));
    progressBar.style.width = ((step + 1) / questions.length * 100) + '%';
  }

  function recommend() {
    if (answers.hair === 'damaged' || answers.goal === 'shine') {
      return 'care';
    }
    if (answers.goal === 'lighter') {
      return 'blond';
    }
    if (answers.goal === 'dimension') {
      return 'balayage';
    }
    return 'toning';
  }

  function getNotes(id) {
    var notes = [];

    if (id === 'blond' && answers.hair === 'dark') {
      notes.push('Тёмная база может потребовать двух визитов.');
    }
    if (id === 'blond' && answers.time === 'short') {
      notes.push('Заложите 4–5 часов или начните с консультации.');
    }
    if (id === 'balayage' && answers.time === 'short') {
      notes.push('На процедуру нужно 3–4 часа — лучше выбрать день свободнее.');
    }
    if (id === 'care' && answers.hair === 'damaged' && answers.goal !== 'shine') {
      notes.push('После восстановления можно вернуться к окрашиванию.');
    }
    if (id === 'toning' && answers.hair === 'blonde') {
      notes.push('Тонирование поддержит оттенок между осветлениями.');
    }

    return notes;
  }

  function showResult() {
    var id = recommend();
    var service = services[id];

    quiz.hidden = true;
    result.hidden = false;

    resultTitle.textContent = service.title;
    resultWhy.textContent = [reasons[id]].concat(getNotes(id)).join(' ');
    resultMeta.textContent = service.time + ' · ' + service.price;
    resultImg.src = service.img;
    resultImg.alt = service.alt;
    resultLink.href = service.url;

    stepLabel.textContent = 'Готово';
    progress.setAttribute('aria-valuenow', '3');
    progressBar.style.width = '100%';
    result.focus();
  }

  function restart() {
    answers = {};
    step = 0;
    result.hidden = true;
    quiz.hidden = false;
    renderOptions();
    questionEl.focus();
  }

  nextBtn.addEventListener('click', function () {
    if (!answers[currentQuestion().key]) {
      return;
    }

    if (step < questions.length - 1) {
      step += 1;
      renderOptions();
      questionEl.focus();
    } else {
      showResult();
    }
  });

  backBtn.addEventListener('click', function () {
    if (step === 0) {
      return;
    }
    step -= 1;
    renderOptions();
    questionEl.focus();
  });

  restartBtn.addEventListener('click', restart);

  quiz.hidden = false;
  renderOptions();
})();
