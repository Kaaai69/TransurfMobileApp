export type OnboardingScreenId =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22;

export type OnboardingQuestionId =
  1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

export type CategoryKey = 'sleep' | 'energy' | 'movement' | 'food' | 'water' | 'mind';
export type CoreTaskCopyKey = `${CategoryKey}-${1 | 2 | 3 | 4 | 5}`;

export type HabitStatusCounts = Readonly<{
  done: number;
  forgiven: number;
  pending: number;
}>;

export type CopyBlock = Readonly<{
  title?: string;
  body: readonly string[];
  primaryAction?: string;
  secondaryAction?: string;
}>;

type OnboardingQuestionCopy = Readonly<{
  id: OnboardingQuestionId;
  screen: 11 | 12 | 13 | 14 | 15 | 16 | 17;
  prompt: string;
  options?: readonly string[];
  control: 'single' | 'time' | 'number';
}>;

type CoreTaskCopy = Readonly<{
  anchorText: string;
  actionText: string;
  subtitle: string;
  sourceCitation: string | null;
  sourceNote: string | null;
}>;

export type RuCopyShape = Readonly<{
  common: Readonly<{ back: string; continue: string; later: string }>;
  categories: Record<CategoryKey, string>;
  tabs: Readonly<{ day: string; method: string; settings: string }>;
  accessibility: Readonly<{
    habitRingLabel: string;
    habitRingSummary: (counts: HabitStatusCounts) => string;
  }>;
  onboarding: Readonly<{
    totalQuestions: 16;
    progress: (current: number) => string;
    stepProgress: (current: number, total: number) => string;
    weakestTitle: (category: string, value: number) => string;
    firstTaskHeading: (anchor: string, action: string) => string;
    manifesto: Readonly<{
      cycleNodes: readonly [string, string, string, string];
      audioOnLabel: string;
      audioOffLabel: string;
      cycleAccessibilityLabel: string;
      graphAccessibilityLabel: string;
      sourceLink: string;
      streakLineLabel: string;
      graceLineLabel: string;
    }>;
    screens: Record<OnboardingScreenId, CopyBlock>;
    questions: readonly OnboardingQuestionCopy[];
  }>;
  milestones: Record<3 | 7 | 11 | 14, CopyBlock>;
  daily: Readonly<{
    coreLabel: string;
    supportLabel: string;
    todayLabel: string;
    dayCounter: (day: number, total: number) => string;
    markDone: string;
    doneToday: string;
    graceChip: (left: number, total: number) => string;
    supportEmpty: string;
    xpCaption: (xp: number) => string;
  }>;
  method: Readonly<{
    title: string;
    intro: string;
    waterNote: string;
  }>;
  sources: Readonly<{
    journalYear: (journal: string, year: number) => string;
    openLink: string;
  }>;
  recalc: Readonly<{
    unchangedSymbol: string;
    upSymbol: string;
    downSymbol: string;
    explanationUp: (category: string) => string;
    explanationDown: (category: string) => string;
    explanationSame: (category: string) => string;
    graceUnused: (left: number, total: number) => string;
    graceUsed: (left: number, total: number) => string;
  }>;
  tierOffer: Readonly<{
    nextStep: (actionText: string) => string;
    supportNote: string;
    postponeConfirmed: string;
  }>;
  downgrade: Readonly<{
    title: string;
    body: readonly string[];
    keep: string;
    stepDown: string;
    stepDownConfirmed: string;
  }>;
  missedDay: Readonly<{
    remainingLine: (left: number, total: number) => string;
  }>;
  settings: Readonly<{
    title: string;
    notifications: string;
    notificationsOn: string;
    notificationsOff: string;
    reset: string;
    resetConfirm: string;
    resetCancel: string;
    version: (version: string) => string;
  }>;
  foundation: Readonly<{
    title: string;
    levels: string;
    forms: string;
    components: string;
    rings: string;
    selected: string;
  }>;
  content: Readonly<{
    coreTasks: Record<CoreTaskCopyKey, CoreTaskCopy>;
  }>;
}>;

export const ru = {
  common: {
    back: 'Назад',
    continue: 'Продолжить',
    later: 'Позже',
  },
  categories: {
    sleep: 'Сон',
    energy: 'Энергия',
    movement: 'Движение',
    food: 'Еда',
    water: 'Вода',
    mind: 'Ум',
  },
  tabs: {
    day: 'День',
    method: 'Метод',
    settings: 'Настройки',
  },
  accessibility: {
    habitRingLabel: 'Кольцо привычки',
    habitRingSummary: ({ done, forgiven, pending }: HabitStatusCounts) =>
      `Выполнено: ${done}. Прощено: ${forgiven}. Впереди: ${pending}.`,
  },
  onboarding: {
    totalQuestions: 16,
    progress: (current: number) => `${current} / 16`,
    stepProgress: (current: number, total: number) => `Шаг ${current} из ${total}`,
    weakestTitle: (category: string, value: number) =>
      `Самое слабое звено — ${category}: ${value}`,
    firstTaskHeading: (anchor: string, action: string) => `Если ${anchor} — ${action}`,
    manifesto: {
      cycleNodes: ['Поздно лёг', 'Недоспал', 'Нет сил днём', 'Кофе после обеда'],
      audioOnLabel: 'Выключить звук',
      audioOffLabel: 'Включить звук',
      cycleAccessibilityLabel:
        'Цикл: поздно лёг, недоспал, нет сил днём, кофе после обеда, снова поздно лёг',
      graphAccessibilityLabel:
        'Сравнение прогресса: стрик падает до нуля, прощённый день сохраняет движение',
      sourceLink: 'Открыть исследование',
      streakLineLabel: 'Стрик сгорает',
      graceLineLabel: 'Прогресс продолжается',
    },
    screens: {
      1: {
        body: [
          'Ты не ленивый.',
          'Ты просто каждый день начинаешь с нуля.',
          'Просыпаешься уставшим — и весь день догоняешь.\nК вечеру появляются силы, но уже поздно ложиться.\nУтром всё повторяется.',
          'Это не характер.\nЭто режим.',
          'А режим — единственное, что можно переписать.',
        ],
        primaryAction: 'Дальше',
      },
      2: {
        body: [
          'поздно лёг → недоспал → нет сил днём →\nкофе после обеда → поздно лёг',
          'Каждый элемент здесь тянет следующий.\nПоэтому «просто начать вставать раньше» не работает — вы боретесь со всем кругом сразу.',
        ],
        primaryAction: 'Где здесь разрыв?',
      },
      3: {
        body: [
          'Круг рвётся не силой воли.\nОн рвётся в одном месте — самом слабом.',
          'Дальше мы найдём, где именно у вас.',
        ],
        primaryAction: 'Продолжить',
      },
      4: {
        title: 'Что делает это приложение',
        body: [
          'Собирает ваш день в шесть измеримых величин',
          'Даёт одно действие за раз, а не список из двадцати',
          'Показывает, что меняется — и что не меняется тоже',
          'Не сбрасывает прогресс за один пропущенный день',
        ],
        primaryAction: 'А чего не делает?',
      },
      5: {
        title: 'Чего оно не делает',
        body: [
          'Не ставит диагнозы. Это не медицинское приложение.',
          'Не обещает, что через месяц вы станете другим человеком.',
          'Не считает ваш «генетический потенциал». Такой метрики не существует.',
          'Не продаёт мотивацию. Мотивация заканчивается на четвёртый день, работает система.',
        ],
        primaryAction: 'Понятно',
      },
      6: {
        body: [
          'Сон · Энергия · Движение · Еда · Вода · Ум',
          'Шесть чисел, которые вы будете видеть каждый день.\nСейчас мы их посчитаем.',
        ],
        primaryAction: 'Продолжить',
      },
      7: {
        body: ['Стрики. Очки. Уровни. Ранги.', 'Всё это работает ровно до первого срыва.'],
        primaryAction: 'Дальше',
      },
      8: {
        body: [
          'А потом начинает работать против вас.',
          'Стрик в 47 дней сгорает за один вечер — и вместе с ним желание начинать заново.\nВы теряете не день. Вы теряете полтора месяца в собственной голове.',
          'Мы сделали иначе.',
          'В исследовании, на котором построен наш метод, пропуск одного дня не влиял на формирование привычки.\nЗначит, и у нас не влияет.',
          'Lally et al., European Journal of Social Psychology, 2010',
        ],
        primaryAction: 'Это честно',
      },
      9: {
        body: [
          'Жизнь — это не игра, в которой можно проиграть.',
          'Здесь нет счёта. Есть только то, как вы себя чувствуете в четверг днём.',
        ],
        primaryAction: 'Дальше',
      },
      10: {
        title: 'Дальше — 16 вопросов. Примерно три минуты.',
        body: [
          'Часть из них будет неприятной.\nМы не спросим, кем вы хотите стать. Мы спросим, как вы живёте сейчас.',
          'Отвечайте честно. Иначе всё дальнейшее не имеет смысла — считать будем по вашим ответам, а не по нашим догадкам.',
        ],
        primaryAction: 'Отвечу честно',
        secondaryAction: 'Пропустить и посмотреть приложение',
      },
      11: { title: 'Сон', body: [] },
      12: { title: 'Энергия и кофеин', body: [] },
      13: { title: 'Движение', body: [] },
      14: { title: 'Еда и вода', body: [] },
      15: { title: 'Ум и внимание', body: [] },
      16: { title: 'Приоритет', body: [] },
      17: { title: 'Реальный бюджет времени', body: [] },
      18: {
        body: ['Считаем ваши шесть значений', 'Ищем самое слабое звено', 'Подбираем первую задачу'],
      },
      19: {
        title: 'Ваш профиль',
        body: [
          'Это не оценка вас. Это описание вашего текущего режима, посчитанное по вашим ответам.',
          'Значения рассчитаны по вашим ответам и не являются медицинской оценкой.',
        ],
      },
      20: {
        title: 'Самое слабое звено',
        body: [
          'Обычно именно оно тянет остальные вниз.',
          'Начнём с него — не потому что оно «хуже всех», а потому что там больше всего свободного хода.',
        ],
        primaryAction: 'Что делаем',
      },
      21: {
        title: 'Ваша первая задача',
        body: [
          'Не тренировка. Не абонемент. Просто не сидеть, когда можно не сидеть.',
          'В зачёт идут куски любой длины — так сказано в рекомендациях ВОЗ.',
          'Почему именно так сформулировано: планы вида «если — то» дают средне-большой эффект на выполнение по метаанализу 94 исследований.\nGollwitzer & Sheeran, 2006',
        ],
        primaryAction: 'Беру',
      },
      22: {
        title: 'Откуда мы это взяли',
        body: [
          'Ниже — работы, на которых построены задачи в приложении.\nВсе ссылки открываются. Мы не пересказываем «исследования учёных» — мы называем конкретные.',
          'Полный список — в разделе «Метод».',
        ],
        primaryAction: 'Дальше',
      },
    },
    questions: [
      { id: 1, screen: 11, prompt: 'Во сколько вы обычно ложитесь?', control: 'time' },
      { id: 2, screen: 11, prompt: 'Сколько часов вы реально спите?', control: 'number' },
      {
        id: 3,
        screen: 11,
        prompt: 'Как часто просыпаетесь с ощущением, что не выспались?',
        options: ['Почти каждый день', 'Несколько раз в неделю', 'Редко', 'Почти никогда'],
        control: 'single',
      },
      {
        id: 4,
        screen: 12,
        prompt: 'Когда у вас пик энергии?',
        options: ['Утро', 'День', 'Вечер', 'Ночь', 'Пика нет'],
        control: 'single',
      },
      {
        id: 5,
        screen: 12,
        prompt: 'Сколько порций кофеина в день? (кофе, энергетики, крепкий чай)',
        options: ['Нет', '1–2', '3–4', '5 и больше'],
        control: 'single',
      },
      { id: 6, screen: 12, prompt: 'Во сколько последняя порция?', control: 'time' },
      {
        id: 7,
        screen: 13,
        prompt: 'Сколько раз в неделю двигаетесь хотя бы 20 минут подряд?',
        options: ['0', '1–2', '3–4', '5 и больше'],
        control: 'single',
      },
      {
        id: 8,
        screen: 13,
        prompt: 'Сколько часов в день сидите?',
        options: ['Меньше 4', '4–7', '8–11', 'Больше 11'],
        control: 'single',
      },
      {
        id: 9,
        screen: 14,
        prompt: 'Как часто едите в спешке или перед экраном?',
        options: ['Почти всегда', 'Часто', 'Иногда', 'Редко'],
        control: 'single',
      },
      { id: 10, screen: 14, prompt: 'Во сколько первый приём пищи?', control: 'time' },
      {
        id: 11,
        screen: 14,
        prompt: 'Сколько воды в день, не считая кофе и чая?',
        options: ['Меньше стакана', '2–3 стакана', '4–6', 'Больше 6'],
        control: 'single',
      },
      {
        id: 12,
        screen: 15,
        prompt: 'Что чаще всего мешает сосредоточиться?',
        options: [
          'Не могу остановить мысли',
          'Телефон',
          'Усталость',
          'Отвлекают другие',
          'Нет проблем с этим',
        ],
        control: 'single',
      },
      {
        id: 13,
        screen: 15,
        prompt: 'Как часто не можете «выключить» голову перед сном?',
        options: ['Почти каждый вечер', 'Несколько раз в неделю', 'Редко', 'Почти никогда'],
        control: 'single',
      },
      {
        id: 14,
        screen: 15,
        prompt: 'Первое, что делаете после пробуждения?',
        options: ['Беру телефон', 'Иду в душ', 'Ем', 'Выхожу на свет', 'Другое'],
        control: 'single',
      },
      {
        id: 15,
        screen: 16,
        prompt: 'Что важнее прямо сейчас?',
        options: [
          'Высыпаться',
          'Держать фокус',
          'Больше энергии',
          'Меньше тревоги',
          'Форма и вес',
          'Просто перестать откладывать',
        ],
        control: 'single',
      },
      {
        id: 16,
        screen: 17,
        prompt: 'Сколько минут в день вы реально готовы вкладывать?',
        options: ['5', '15', '30', 'Больше'],
        control: 'single',
      },
    ],
  },
  daily: {
    coreLabel: 'Ядро',
    supportLabel: 'Поддержка',
    todayLabel: 'Сегодня',
    dayCounter: (day: number, total: number) => `день ${day} / ${total}`,
    markDone: 'Сделал',
    doneToday: 'Готово на сегодня',
    graceChip: (left: number, total: number) => `Прощённые дни: ${left} из ${total}`,
    supportEmpty: 'Здесь появятся задачи, прошедшие ядро.',
    xpCaption: (xp: number) => `${xp} XP`,
  },
  method: {
    title: 'Метод',
    intro:
      'Работы, на которых построены задачи в приложении. Все ссылки открываются. По воде мы не нашли исследования, за которое готовы поручиться, — задачи этой категории остаются просто разумной привычкой.',
    waterNote: 'По воде исследований в подборке нет — и это сказано прямо.',
  },
  sources: {
    journalYear: (journal: string, year: number) => `${journal}, ${year}`,
    openLink: 'Открыть источник',
  },
  recalc: {
    unchangedSymbol: '—',
    upSymbol: '↑',
    downSymbol: '↓',
    explanationUp: (category: string) =>
      `${category} подрос — задача закрывалась чаще, чем нет.`,
    explanationDown: (category: string) =>
      `${category} просела: анкета была оптимистичнее реальности. Это нормально, так у большинства.`,
    explanationSame: (category: string) =>
      `${category} не двинулось — отметок этой категории пока почти не было.`,
    graceUnused: (left: number, total: number) =>
      `Прощённые дни: ${left} из ${total} — не понадобились`,
    graceUsed: (left: number, total: number) => `Прощённые дни: ${left} из ${total}`,
  },
  tierOffer: {
    nextStep: (actionText: string) => `Следующая ступень: ${actionText}.`,
    supportNote: 'Первая задача переходит в поддержку — отмечать одним касанием.',
    postponeConfirmed: 'Хорошо. Вернёмся к этому через неделю.',
  },
  downgrade: {
    title: 'Задача не подошла',
    body: [
      'Несколько пропусков за две недели. Это не провал — это сигнал, что задача не подошла. Возьмём проще?',
    ],
    keep: 'Оставить как есть',
    stepDown: 'Спуститься на тир ниже',
    stepDownConfirmed: 'Хорошо. Задача упрощена, цепочка цела.',
  },
  missedDay: {
    remainingLine: (left: number, total: number) =>
      `Использовали прощённый день. Осталось ${left} из ${total}.`,
  },
  settings: {
    title: 'Настройки',
    notifications: 'Напоминания',
    notificationsOn: 'Включены',
    notificationsOff: 'Выключены',
    reset: 'Начать заново',
    resetConfirm: 'Точно начать заново? Ответы, прогресс и задачи будут удалены.',
    resetCancel: 'Отмена',
    version: (version: string) => `Версия ${version}`,
  },
  milestones: {
    3: {
      title: 'Третий день. Обычно здесь становится скучно.',
      body: [
        'Это нормально и это не про вас. Привычка становится автоматической в среднем за 66 дней — сейчас идёт четвёртый.',
        'Lally et al., 2010',
      ],
    },
    7: {
      title: 'Неделя. Пересчитали.',
      body: [
        'В первый день числа были построены на ваших ответах. Теперь — на том, что вы делали.',
      ],
    },
    11: {
      title: 'Вчера пропустили.',
      body: [
        'Использовали прощённый день. Осталось 1 из 2.\nЦепочка цела, ничего не сгорело.',
        'В исследовании, на котором это построено, пропуск одного дня не влиял на формирование привычки.\nLally et al., 2010',
        'Сегодня — как обычно.',
      ],
    },
    14: {
      title: 'Две недели.',
      body: [
        'Остальное почти не двинулось — так и должно быть. Мы работали над одним.',
        'Задача держится достаточно, чтобы идти дальше.',
      ],
      primaryAction: 'Беру следующую',
      secondaryAction: 'Остаться на этой ещё на неделю',
    },
  },
  foundation: {
    title: 'Система света',
    levels: 'Уровни',
    forms: 'Формы',
    components: 'Компоненты',
    rings: 'Кольца',
    selected: 'Выбрано',
  },
  content: {
    coreTasks: {
      'sleep-1': {
        anchorText: 'время 22:30',
        actionText: 'телефон едет на зарядку на кухню',
        subtitle: 'Не «ложись раньше». Просто убери из спальни то, из-за чего не ложишься.',
        sourceCitation: 'Van Dongen et al., Sleep, 2003',
        sourceNote:
          '14 дней по 6 часов дают накопленное падение внимания, которое сам человек почти не замечает. Начинаем с того, что отодвигает отбой.',
      },
      'sleep-2': {
        anchorText: 'сработал будильник',
        actionText: 'встаю, не переставляю',
        subtitle:
          'Фиксированный подъём держит ритм сильнее, чем фиксированный отбой. Ложиться вовремя станет проще само.',
        sourceCitation: 'Van Dongen et al., Sleep, 2003',
        sourceNote: 'Время подъёма берётся из анкеты, допуск ±30 мин.',
      },
      'sleep-3': {
        anchorText: 'время после 15:00',
        actionText: 'кофе меняю на воду',
        subtitle:
          'Кофеин за 6 часов до сна сокращает сон примерно на час. Участники исследования этого не замечали — по дневникам они спали нормально, приборы показывали другое.',
        sourceCitation: 'Drake et al., J Clin Sleep Med, 2013',
        sourceNote: 'Доза в исследовании — 400 мг, это около четырёх чашек.',
      },
      'sleep-4': {
        anchorText: 'проснулся',
        actionText: '10 минут у окна или на улице, до телефона',
        subtitle: 'Утренний свет — самый сильный сигнал для внутренних часов.',
        sourceCitation: 'Wright et al., Current Biology, 2013',
        sourceNote:
          'В исследовании неделя при одном естественном свете сдвинула часы на 2 часа раньше; n=8, кемпинг. Не обещаем два часа.',
      },
      'sleep-5': {
        anchorText: '22:15',
        actionText: 'начинаю укладываться, семь дней в неделю',
        subtitle: 'Выходные ломают ритм сильнее, чем один поздний вторник.',
        sourceCitation: 'Van Dongen et al., Sleep, 2003',
        sourceNote: 'Допуск ±20 мин.',
      },
      'energy-1': {
        anchorText: 'проснулся',
        actionText: 'сначала к окну, потом всё остальное',
        subtitle: 'Самый дешёвый способ сдвинуть день. Ничего не нужно, кроме окна.',
        sourceCitation: 'Wright et al., Current Biology, 2013',
        sourceNote: null,
      },
      'energy-2': {
        anchorText: 'проснулся',
        actionText: 'первые 15 минут без телефона',
        subtitle: 'Не про цифровой детокс. Про то, чтобы первые решения дня были ваши, а не ленты.',
        sourceCitation: null,
        sourceNote: null,
      },
      'energy-3': {
        anchorText: 'прошёл час сидя',
        actionText: 'встаю на 2 минуты',
        subtitle:
          'ВОЗ отдельно рекомендует сокращать время сидения, независимо от того, тренируетесь вы или нет.',
        sourceCitation: 'Bull et al. / ВОЗ, BJSM, 2020',
        sourceNote: null,
      },
      'energy-4': {
        anchorText: 'после обеда тянет в сон',
        actionText: '10 минут пешком вместо кофе',
        subtitle: 'Кофе в это время заберёт час сна вечером. Ходьба — нет.',
        sourceCitation: 'Drake et al., 2013 + Bull et al., 2020',
        sourceNote: null,
      },
      'energy-5': {
        anchorText: 'закончил работу',
        actionText: 'фиксирую время и не возвращаюсь',
        subtitle:
          'Размытая граница дня съедает вечер, вечер съедает сон, сон съедает следующий день.',
        sourceCitation: 'Van Dongen et al., Sleep, 2003',
        sourceNote: null,
      },
      'movement-1': {
        anchorText: 'говорю по телефону',
        actionText: 'иду пешком',
        subtitle: 'Не тренировка. В зачёт по рекомендациям ВОЗ идут куски любой длины.',
        sourceCitation: 'Bull et al. / ВОЗ, BJSM, 2020',
        sourceNote:
          'В рекомендациях 2020 года отдельно оговорено, что эпизоды любой продолжительности засчитываются — в отличие от версии 2010 года.',
      },
      'movement-2': {
        anchorText: 'встал за водой',
        actionText: 'прохожу лишний круг',
        subtitle: 'Цель — не шаги, а меньше непрерывного сидения.',
        sourceCitation: 'Bull et al. / ВОЗ, BJSM, 2020',
        sourceNote: null,
      },
      'movement-3': {
        anchorText: 'вторник или четверг',
        actionText: '20 минут непрерывной ходьбы',
        subtitle: 'Первый повторяющийся блок. Два раза в неделю, фиксированные дни.',
        sourceCitation: 'Bull et al. / ВОЗ, BJSM, 2020',
        sourceNote: null,
      },
      'movement-4': {
        anchorText: 'недельный счётчик',
        actionText: 'набираю 150 минут в неделю, любыми кусками',
        subtitle: 'Нижняя граница рекомендации ВОЗ для взрослых. Верхняя — 300.',
        sourceCitation: 'Bull et al. / ВОЗ, BJSM, 2020',
        sourceNote: 'Отображается прогресс-полоса недели, а не ежедневная галочка.',
      },
      'movement-5': {
        anchorText: 'расписание недели',
        actionText: '45 минут, 3–5 раз в неделю. Больше — не лучше',
        subtitle:
          'По крупнейшему исследованию связи движения и состояния максимум пользы для настроения — здесь. Больше 23 сессий в месяц или дольше 90 минут связано с худшими показателями.',
        sourceCitation: 'Chekroud et al., Lancet Psychiatry, 2018',
        sourceNote: 'Поперечное исследование, показывает связь, а не причину.',
      },
      'food-1': {
        anchorText: 'сел есть',
        actionText: 'телефон экраном вниз',
        subtitle: 'Один приём пищи в день с вниманием на еде.',
        sourceCitation: 'Jacka et al., BMC Medicine, 2017',
        sourceNote: null,
      },
      'food-2': {
        anchorText: 'ем',
        actionText: 'сижу за столом, а не на ходу',
        subtitle:
          'Еда стоя у холодильника не считается приёмом пищи ни для головы, ни для желудка.',
        sourceCitation: 'Jacka et al., BMC Medicine, 2017',
        sourceNote: null,
      },
      'food-3': {
        anchorText: 'прошёл час после подъёма',
        actionText: 'завтракаю',
        subtitle:
          'Не про «завтрак обязателен». Про то, чтобы первый приём пищи не сползал на три часа дня.',
        sourceCitation: 'Jacka et al., BMC Medicine, 2017',
        sourceNote: 'Показывается, только если в анкете первый приём пищи позже 12:00.',
      },
      'food-4': {
        anchorText: 'готовлю ужин',
        actionText: 'добавляю одну овощную позицию',
        subtitle:
          'Добавляем, а не убираем. В исследовании работала замена состава, а не сокращение.',
        sourceCitation: 'Jacka et al., BMC Medicine, 2017',
        sourceNote: null,
      },
      'food-5': {
        anchorText: 'утро',
        actionText: 'решаю, что буду есть сегодня',
        subtitle:
          'Решение, принятое утром на трезвую голову, лучше решения в 20:00 на голодный желудок.',
        sourceCitation: 'Gollwitzer & Sheeran, 2006',
        sourceNote: null,
      },
      'water-1': {
        anchorText: 'сел работать',
        actionText: 'стакан воды рядом',
        subtitle: '',
        sourceCitation: null,
        sourceNote: null,
      },
      'water-2': {
        anchorText: 'проснулся',
        actionText: 'стакан воды до кофе',
        subtitle: '',
        sourceCitation: null,
        sourceNote: null,
      },
      'water-3': {
        anchorText: 'закончил встречу/задачу',
        actionText: 'допиваю стакан',
        subtitle: '',
        sourceCitation: null,
        sourceNote: null,
      },
      'water-4': {
        anchorText: 'вышел из дома',
        actionText: 'бутылка с собой',
        subtitle: '',
        sourceCitation: null,
        sourceNote: null,
      },
      'water-5': {
        anchorText: 'поел',
        actionText: 'стакан воды после',
        subtitle: '',
        sourceCitation: null,
        sourceNote: null,
      },
      'mind-1': {
        anchorText: 'чувствую, что разгоняюсь',
        actionText: '5 минут дыхания с длинным выдохом',
        subtitle: 'Вдох через нос, короткий добор, длинный выдох через рот. Пять минут.',
        sourceCitation: 'Balban et al., Cell Reports Medicine, 2023',
        sourceNote:
          'В рандомизированном исследовании пять минут такого дыхания в день улучшали настроение сильнее, чем те же пять минут медитации осознанности.',
      },
      'mind-2': {
        anchorText: 'проснулся',
        actionText: '15 минут без ленты',
        subtitle: '',
        sourceCitation: null,
        sourceNote: null,
      },
      'mind-3': {
        anchorText: 'закрыл ноутбук',
        actionText: '10 минут тишины',
        subtitle:
          'Метаанализ рандомизированных испытаний даёт небольшое-умеренное снижение тревожности и стресса. Небольшое-умеренное — так и написано в исследовании, мы не преувеличиваем.',
        sourceCitation: 'Goyal et al., JAMA Internal Medicine, 2014',
        sourceNote: null,
      },
      'mind-4': {
        anchorText: '21:00',
        actionText: 'выписываю всё, что крутится в голове',
        subtitle: 'Для тех, кто не может «выключить» голову перед сном.',
        sourceCitation: 'Gollwitzer & Sheeran, 2006',
        sourceNote: 'Приоритет для ответивших «почти каждый вечер» на вопрос 13.',
      },
      'mind-5': {
        anchorText: 'закончил работу',
        actionText: 'три минуты на план завтра, потом закрываю',
        subtitle: '',
        sourceCitation: 'Gollwitzer & Sheeran, 2006',
        sourceNote: null,
      },
    },
  },
} as const satisfies RuCopyShape;

export type RuCopy = typeof ru;
