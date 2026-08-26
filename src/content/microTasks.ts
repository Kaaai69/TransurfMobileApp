import type { Category } from '../db/schema';

export type MicroTaskTemplate = Readonly<{
  id: string;
  category: Category;
  actionText: string;
}>;

type MicroTaskSource = readonly [Category, readonly string[]];

const sources: readonly MicroTaskSource[] = [
  [
    'sleep',
    [
      'Проверить, во сколько вчера легли — и сказать вслух, устраивает ли',
      'Убрать один источник света из спальни',
      'Поставить будильник на 15 минут раньше обычного отбоя как напоминание',
      'Заправить кровать утром',
      'Проветрить спальню за час до сна',
      'Найти, где в квартире будет жить телефон ночью',
      'Записать, во сколько сегодня появилась усталость',
    ],
  ],
  [
    'energy',
    [
      'Выйти на улицу на 5 минут в течение первого часа после подъёма',
      'Посчитать, сколько кофеина было вчера',
      'Открыть окно на 10 минут в комнате, где работаете',
      'Заменить одну порцию кофе на воду',
      'Отметить, в какой час сегодня было хуже всего',
      'Пообедать не за рабочим столом',
      'Лечь на 10 минут без телефона в момент спада',
    ],
  ],
  [
    'movement',
    [
      'Пройти одну остановку пешком',
      'Подняться по лестнице вместо лифта один раз',
      'Пять минут потянуться после работы',
      'Дойти до магазина пешком вместо доставки',
      'Встать и пройтись во время следующего звонка',
      'Сделать 20 приседаний в любой момент дня',
      'Выйти на 10-минутную прогулку после ужина',
    ],
  ],
  [
    'food',
    [
      'Съесть один приём пищи без телефона и ноутбука',
      'Добавить овощ к любому приёму пищи',
      'Приготовить еду дома вместо заказа — один раз',
      'Есть медленнее обычного один приём пищи',
      'Посмотреть, что есть в холодильнике, и решить, что готовите завтра',
      'Поесть за столом, а не на диване',
      'Взять еду с собой, если день вне дома',
    ],
  ],
  [
    'water',
    [
      'Выпить стакан воды до первого кофе',
      'Поставить бутылку на рабочий стол',
      'Выпить воды после каждого приёма пищи сегодня',
      'Взять воду с собой из дома',
      'Отметить, сколько выпили за день',
      'Заменить один сладкий напиток на воду',
      'Выпить стакан воды сразу после пробуждения',
    ],
  ],
  [
    'mind',
    [
      'Пять минут дыхания с длинным выдохом',
      'Выписать три вещи, которые крутятся в голове',
      'Десять минут без единого экрана',
      'Убрать одно приложение с первого экрана телефона',
      'Сделать одно дело, которое откладывали больше недели',
      'Прогулка без наушников',
      'Написать, что было лучшим за сегодня',
    ],
  ],
];

/** Библиотека микрозадач из docs/task-library.md §4: 6 категорий × 7 задач. */
export const microTaskTemplates: readonly {
  id: string;
  category: Category;
  slot: 'micro';
  tier: null;
  anchorText: string;
  actionText: string;
  subtitle: string;
  sourceDoi: string | null;
  sourceCitation: string | null;
  sourceNote: string | null;
  minBudgetMin: 5;
  stopfactorTags: readonly string[];
}[] = sources.flatMap(([category, texts]) =>
  texts.map((actionText, index) => ({
    id: `micro-${category}-${index + 1}`,
    category,
    slot: 'micro' as const,
    tier: null,
    anchorText: '',
    actionText,
    subtitle: '',
    sourceDoi: null,
    sourceCitation: null,
    sourceNote: null,
    minBudgetMin: 5 as const,
    stopfactorTags: [] as readonly string[],
  })),
);

/**
 * Ротация слота «Сегодня»: не конкурирует с ядром по категории
 * и детерминированно меняется каждый день.
 */
export function selectMicroTaskForDay(
  coreCategory: Category,
  daysSinceStart: number,
): MicroTaskTemplate {
  const pool = microTaskTemplates.filter((task) => task.category !== coreCategory);
  const index = ((daysSinceStart % pool.length) + pool.length) % pool.length;

  return pool[index];
}

export function findMicroTemplateById(id: string) {
  return microTaskTemplates.find((task) => task.id === id) ?? null;
}
