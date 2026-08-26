import { selectFirstTaskTemplateId } from './firstTask';

describe('selectFirstTaskTemplateId', () => {
  test('starts with tier one of the weakest link', () => {
    expect(selectFirstTaskTemplateId('movement', { budgetMinutes: 15 })).toBe('movement-1');
    expect(selectFirstTaskTemplateId('sleep', { budgetMinutes: 30 })).toBe('sleep-1');
    expect(selectFirstTaskTemplateId('water', { budgetMinutes: 'more' })).toBe('water-1');
  });

  test('a five minute budget always starts with the breathing task', () => {
    expect(selectFirstTaskTemplateId('sleep', { budgetMinutes: 5 })).toBe('mind-1');
    expect(selectFirstTaskTemplateId('movement', { budgetMinutes: 5 })).toBe('mind-1');
    expect(selectFirstTaskTemplateId('water', { budgetMinutes: 5 })).toBe('mind-1');
  });
});
