import { ru } from './ru';

describe('Russian copy contract', () => {
  test('covers the complete onboarding flow and honest question count', () => {
    expect(Object.keys(ru.onboarding.screens)).toHaveLength(22);
    expect(ru.onboarding.questions).toHaveLength(16);
    expect(ru.onboarding.totalQuestions).toBe(16);
    expect(ru.onboarding.progress(7)).toBe('7 / 16');
    expect(ru.onboarding.stepProgress(5, 22).match(/\d+/g)).toEqual(['5', '22']);
    expect(ru.common.back.length).toBeGreaterThan(0);
  });

  test('keeps every question in its documented screen and control sequence', () => {
    expect(
      ru.onboarding.questions.map((question) => ({
        id: question.id,
        screen: question.screen,
        control: question.control,
        hasOptions: 'options' in question,
      })),
    ).toEqual([
      { id: 1, screen: 11, control: 'time', hasOptions: false },
      { id: 2, screen: 11, control: 'number', hasOptions: false },
      { id: 3, screen: 11, control: 'single', hasOptions: true },
      { id: 4, screen: 12, control: 'single', hasOptions: true },
      { id: 5, screen: 12, control: 'single', hasOptions: true },
      { id: 6, screen: 12, control: 'time', hasOptions: false },
      { id: 7, screen: 13, control: 'single', hasOptions: true },
      { id: 8, screen: 13, control: 'single', hasOptions: true },
      { id: 9, screen: 14, control: 'single', hasOptions: true },
      { id: 10, screen: 14, control: 'time', hasOptions: false },
      { id: 11, screen: 14, control: 'single', hasOptions: true },
      { id: 12, screen: 15, control: 'single', hasOptions: true },
      { id: 13, screen: 15, control: 'single', hasOptions: true },
      { id: 14, screen: 15, control: 'single', hasOptions: true },
      { id: 15, screen: 16, control: 'single', hasOptions: true },
      { id: 16, screen: 17, control: 'single', hasOptions: true },
    ]);
  });

  test('keeps milestone structure free of editorial additions', () => {
    expect(Object.keys(ru.milestones).map(Number)).toEqual([3, 7, 11, 14]);
    expect(
      Object.fromEntries(
        Object.entries(ru.milestones).map(([day, milestone]) => [day, milestone.body.length]),
      ),
    ).toEqual({ 3: 2, 7: 1, 11: 3, 14: 2 });

    Object.values(ru.milestones).forEach((milestone) => {
      expect(milestone.title.length).toBeGreaterThan(0);
      milestone.body.forEach((line) => expect(line.length).toBeGreaterThan(0));
    });

    expect(ru.milestones[14].primaryAction.length).toBeGreaterThan(0);
    expect(ru.milestones[14].secondaryAction.length).toBeGreaterThan(0);
    ([3, 7, 11] as const).forEach((day) => {
      expect(ru.milestones[day]).not.toHaveProperty('primaryAction');
      expect(ru.milestones[day]).not.toHaveProperty('secondaryAction');
    });
  });

  test('describes habit statuses without collapsing forgiven into done', () => {
    expect(ru.accessibility.habitRingLabel.length).toBeGreaterThan(0);
    expect(
      ru.accessibility.habitRingSummary({ done: 14, forgiven: 2, pending: 44 }).match(/\d+/g),
    ).toEqual(['14', '2', '44']);
  });
});
