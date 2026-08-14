import { categories } from '../db/schema';
import { coreTaskTemplates } from './tasks';

describe('core task content', () => {
  test('contains six complete five-tier ladders with stable ids', () => {
    expect(coreTaskTemplates).toHaveLength(30);

    for (const category of categories) {
      const ladder = coreTaskTemplates.filter((task) => task.category === category);

      expect(ladder.map((task) => task.id)).toEqual(
        [1, 2, 3, 4, 5].map((tier) => `${category}-${tier}`),
      );
      expect(ladder.map((task) => task.tier)).toEqual([1, 2, 3, 4, 5]);
      expect(ladder.every((task) => task.slot === 'core')).toBe(true);
    }
  });

  test('keeps the documented source coverage without inventing water citations', () => {
    expect(coreTaskTemplates.filter((task) => task.sourceDoi !== null)).toHaveLength(23);
    expect(
      coreTaskTemplates
        .filter((task) => task.category === 'water')
        .every((task) => task.sourceDoi === null),
    ).toBe(true);
  });

  test('provides complete seed values and valid budget buckets', () => {
    for (const task of coreTaskTemplates) {
      expect(task.anchorText.length).toBeGreaterThan(0);
      expect(task.actionText.length).toBeGreaterThan(0);
      expect([5, 15, 30]).toContain(task.minBudgetMin);
      expect(task.stopfactorTags).toEqual([]);
    }
  });
});
