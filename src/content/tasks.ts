import type { CoreTaskCopyKey } from '../i18n/ru';
import { ru } from '../i18n/ru';
import { taskTemplate, type Category } from '../db/schema';

type CoreTaskTemplate = typeof taskTemplate.$inferInsert;
type Tier = 1 | 2 | 3 | 4 | 5;
type Budget = 5 | 15 | 30;

type CoreTaskMetadata = Readonly<{
  id: CoreTaskCopyKey;
  category: Category;
  tier: Tier;
  sourceDoi: string | null;
  minBudgetMin: Budget;
}>;

const metadata = [
  {
    id: 'sleep-1',
    category: 'sleep',
    tier: 1,
    sourceDoi: '10.1093/sleep/26.2.117',
    minBudgetMin: 5,
  },
  {
    id: 'sleep-2',
    category: 'sleep',
    tier: 2,
    sourceDoi: '10.1093/sleep/26.2.117',
    minBudgetMin: 5,
  },
  { id: 'sleep-3', category: 'sleep', tier: 3, sourceDoi: '10.5664/jcsm.3170', minBudgetMin: 5 },
  {
    id: 'sleep-4',
    category: 'sleep',
    tier: 4,
    sourceDoi: '10.1016/j.cub.2013.06.039',
    minBudgetMin: 15,
  },
  {
    id: 'sleep-5',
    category: 'sleep',
    tier: 5,
    sourceDoi: '10.1093/sleep/26.2.117',
    minBudgetMin: 5,
  },
  {
    id: 'energy-1',
    category: 'energy',
    tier: 1,
    sourceDoi: '10.1016/j.cub.2013.06.039',
    minBudgetMin: 5,
  },
  { id: 'energy-2', category: 'energy', tier: 2, sourceDoi: null, minBudgetMin: 15 },
  {
    id: 'energy-3',
    category: 'energy',
    tier: 3,
    sourceDoi: '10.1136/bjsports-2020-102955',
    minBudgetMin: 5,
  },
  { id: 'energy-4', category: 'energy', tier: 4, sourceDoi: '10.5664/jcsm.3170', minBudgetMin: 15 },
  {
    id: 'energy-5',
    category: 'energy',
    tier: 5,
    sourceDoi: '10.1093/sleep/26.2.117',
    minBudgetMin: 5,
  },
  {
    id: 'movement-1',
    category: 'movement',
    tier: 1,
    sourceDoi: '10.1136/bjsports-2020-102955',
    minBudgetMin: 5,
  },
  {
    id: 'movement-2',
    category: 'movement',
    tier: 2,
    sourceDoi: '10.1136/bjsports-2020-102955',
    minBudgetMin: 5,
  },
  {
    id: 'movement-3',
    category: 'movement',
    tier: 3,
    sourceDoi: '10.1136/bjsports-2020-102955',
    minBudgetMin: 30,
  },
  {
    id: 'movement-4',
    category: 'movement',
    tier: 4,
    sourceDoi: '10.1136/bjsports-2020-102955',
    minBudgetMin: 30,
  },
  {
    id: 'movement-5',
    category: 'movement',
    tier: 5,
    sourceDoi: '10.1016/S2215-0366(18)30227-X',
    minBudgetMin: 30,
  },
  {
    id: 'food-1',
    category: 'food',
    tier: 1,
    sourceDoi: '10.1186/s12916-017-0791-y',
    minBudgetMin: 5,
  },
  {
    id: 'food-2',
    category: 'food',
    tier: 2,
    sourceDoi: '10.1186/s12916-017-0791-y',
    minBudgetMin: 5,
  },
  {
    id: 'food-3',
    category: 'food',
    tier: 3,
    sourceDoi: '10.1186/s12916-017-0791-y',
    minBudgetMin: 5,
  },
  {
    id: 'food-4',
    category: 'food',
    tier: 4,
    sourceDoi: '10.1186/s12916-017-0791-y',
    minBudgetMin: 5,
  },
  {
    id: 'food-5',
    category: 'food',
    tier: 5,
    sourceDoi: '10.1016/S0065-2601(06)38002-1',
    minBudgetMin: 5,
  },
  { id: 'water-1', category: 'water', tier: 1, sourceDoi: null, minBudgetMin: 5 },
  { id: 'water-2', category: 'water', tier: 2, sourceDoi: null, minBudgetMin: 5 },
  { id: 'water-3', category: 'water', tier: 3, sourceDoi: null, minBudgetMin: 5 },
  { id: 'water-4', category: 'water', tier: 4, sourceDoi: null, minBudgetMin: 5 },
  { id: 'water-5', category: 'water', tier: 5, sourceDoi: null, minBudgetMin: 5 },
  {
    id: 'mind-1',
    category: 'mind',
    tier: 1,
    sourceDoi: '10.1016/j.xcrm.2022.100895',
    minBudgetMin: 5,
  },
  { id: 'mind-2', category: 'mind', tier: 2, sourceDoi: null, minBudgetMin: 15 },
  {
    id: 'mind-3',
    category: 'mind',
    tier: 3,
    sourceDoi: '10.1001/jamainternmed.2013.13018',
    minBudgetMin: 15,
  },
  {
    id: 'mind-4',
    category: 'mind',
    tier: 4,
    sourceDoi: '10.1016/S0065-2601(06)38002-1',
    minBudgetMin: 5,
  },
  {
    id: 'mind-5',
    category: 'mind',
    tier: 5,
    sourceDoi: '10.1016/S0065-2601(06)38002-1',
    minBudgetMin: 5,
  },
] as const satisfies readonly CoreTaskMetadata[];

export const coreTaskTemplates: readonly CoreTaskTemplate[] = metadata.map((task) => ({
  ...task,
  ...ru.content.coreTasks[task.id],
  slot: 'core',
  stopfactorTags: [],
}));

export function findCoreTaskTemplateById(id: string): CoreTaskTemplate | null {
  return coreTaskTemplates.find((task) => task.id === id) ?? null;
}
