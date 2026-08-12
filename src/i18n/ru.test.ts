import { ru } from './ru';

describe('Russian copy contract', () => {
  test('covers the complete onboarding flow and honest question count', () => {
    expect(Object.keys(ru.onboarding.screens)).toHaveLength(22);
    expect(ru.onboarding.questions).toHaveLength(16);
    expect(ru.onboarding.totalQuestions).toBe(16);
    expect(ru.onboarding.progress(7)).toBe('7 / 16');
  });

  test.each([3, 7, 11, 14] as const)('contains milestone day %s', (day) => {
    expect(ru.milestones[day].title.length).toBeGreaterThan(0);
    expect(ru.milestones[day].body.length).toBeGreaterThan(0);
  });
});
