import { categories, type Category } from '../db/schema';

export type StateValues = Record<Category, number>;
export type DriftSlot = 'core' | 'support' | 'micro';
export type DriftStatus = 'done' | 'skipped' | 'no_entry';

export type DriftEvent = Readonly<{
  date: string;
  category: Category;
  slot: DriftSlot;
  status: DriftStatus;
}>;

export type RecalculateStateInput = Readonly<{
  baseline: StateValues;
  events: readonly DriftEvent[];
  asOf: string;
}>;

const dayMilliseconds = 24 * 60 * 60 * 1000;
const slotBase: Record<DriftSlot, number> = { core: 2, support: 0.8, micro: 0.4 };
const adjacentCategories: Record<Category, readonly Category[]> = {
  sleep: ['energy', 'mind'],
  energy: ['sleep', 'movement', 'food'],
  movement: ['energy'],
  food: ['energy'],
  water: [],
  mind: ['sleep'],
};

function utcDay(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return Date.UTC(year, month - 1, day) / dayMilliseconds;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value * 1000) / 1000));
}

function moveToward(value: number, target: number, distance: number) {
  if (value === target) return value;
  if (value > target) return Math.max(target, value - distance);
  return Math.min(target, value + distance);
}

function applyEvent(state: StateValues, baseline: StateValues, event: DriftEvent) {
  const affected = [event.category, ...adjacentCategories[event.category]];

  for (const category of affected) {
    const weight = category === event.category ? 1 : 0.3;
    const distance = slotBase[event.slot] * weight;

    if (event.status === 'no_entry') {
      state[category] = clamp(moveToward(state[category], baseline[category], distance * 0.25));
      continue;
    }

    const direction = event.status === 'done' ? 1 : -1;
    state[category] = clamp(state[category] + distance * direction);
  }
}

export function recalculateState({ baseline, events, asOf }: RecalculateStateInput): StateValues {
  const asOfDay = utcDay(asOf);
  const state = Object.fromEntries(
    categories.map((category) => [category, baseline[category]]),
  ) as StateValues;
  const windowEvents = events
    .filter((event) => {
      const age = asOfDay - utcDay(event.date);
      return age >= 0 && age < 14;
    })
    .sort((left, right) => utcDay(left.date) - utcDay(right.date));

  for (const event of windowEvents) {
    applyEvent(state, baseline, event);
  }

  return state;
}
