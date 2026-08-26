import {
  applyQuestionAnswer,
  getFirstUnansweredQuestion,
  getInitialQuestion,
  getNextQuestion,
  getPreviousQuestion,
  getQuestionAnswer,
  getQuestionDefinition,
  getQuestionOptions,
  getQuestionnaireDestinationHref,
  getQuestionnaireResumeDestination,
  getQuestionsForScreen,
  formatQuestionValue,
  isQuestionnaireScreen,
  parseQuestionnaireQuestionId,
} from './questionnaire';

describe('onboarding questionnaire', () => {
  test('skips the caffeine timing question when the user drinks no caffeine', () => {
    const answers = applyQuestionAnswer({}, 5, 'none');

    expect(answers).toEqual({ caffeineServings: 'none', lastCaffeineMinutes: null });
    expect(getQuestionsForScreen(12, answers).map(({ id }) => id)).toEqual([4, 5]);
    expect(getNextQuestion(5, answers)).toEqual({ id: 7, screen: 13 });
    expect(getPreviousQuestion(7, answers)).toEqual({ id: 5, screen: 12 });
  });

  test.each([
    [1, 23 * 60, 'bedtimeMinutes'],
    [2, 7.5, 'sleepHours'],
    [3, 'weekly', 'unrestedFrequency'],
    [4, 'evening', 'energyPeak'],
    [5, 'one_two', 'caffeineServings'],
    [6, 15 * 60, 'lastCaffeineMinutes'],
    [7, 'three_four', 'movementFrequency'],
    [8, 'eight_eleven', 'sittingHours'],
    [9, 'sometimes', 'rushedMealFrequency'],
    [10, 9 * 60, 'firstMealMinutes'],
    [11, 'four_six', 'waterGlasses'],
    [12, 'phone', 'focusBlocker'],
    [13, 'rarely', 'bedtimeThoughtFrequency'],
    [14, 'light', 'morningAction'],
    [15, 'focus', 'priority'],
    [16, 15, 'budgetMinutes'],
  ] as const)('maps question %s to its scoring field', (questionId, value, field) => {
    const answers = applyQuestionAnswer({}, questionId, value);

    expect(answers).toEqual({ [field]: value });
    expect(getQuestionAnswer(answers, questionId)).toBe(value);
  });

  test('restores the first unanswered question on a category screen', () => {
    const answers = applyQuestionAnswer({}, 1, 23 * 60);

    expect(getInitialQuestion(11, undefined, answers)).toEqual({ id: 2, screen: 11 });
  });

  test('finds the first unanswered question across all questionnaire screens', () => {
    expect(getFirstUnansweredQuestion({ budgetMinutes: 15 })).toEqual({ id: 1, screen: 11 });
  });

  test('treats the conditional caffeine question as complete when it is hidden', () => {
    expect(
      getFirstUnansweredQuestion({
        bedtimeMinutes: 23 * 60,
        sleepHours: 7,
        unrestedFrequency: 'rarely',
        energyPeak: 'day',
        caffeineServings: 'none',
        lastCaffeineMinutes: null,
        movementFrequency: 'three_four',
        sittingHours: 'four_seven',
        rushedMealFrequency: 'sometimes',
        firstMealMinutes: 9 * 60,
        waterGlasses: 'four_six',
        focusBlocker: 'phone',
        bedtimeThoughtFrequency: 'weekly',
        morningAction: 'light',
        priority: 'focus',
        budgetMinutes: 15,
      }),
    ).toBeNull();
  });

  test('uses an explicit question when navigating back across category screens', () => {
    expect(getInitialQuestion(12, 5, {})).toEqual({ id: 5, screen: 12 });
  });

  test('restores the final question when every answer in a category is complete', () => {
    const answers = applyQuestionAnswer(
      applyQuestionAnswer(applyQuestionAnswer({}, 1, 23 * 60), 2, 7.5),
      3,
      'weekly',
    );

    expect(getInitialQuestion(11, undefined, answers)).toEqual({ id: 3, screen: 11 });
  });

  test('uses the specified ranges for bedtime and sleep duration', () => {
    expect(getQuestionDefinition(1)).toMatchObject({
      control: 'time',
      defaultValue: 23 * 60,
      maximumValue: 27 * 60,
      minimumValue: 21 * 60,
      step: 15,
    });
    expect(getQuestionDefinition(2)).toMatchObject({
      control: 'number',
      defaultValue: 7,
      maximumValue: 10,
      minimumValue: 4,
      step: 0.5,
    });
  });

  test('formats slider values for Russian question copy', () => {
    expect(formatQuestionValue(1, 27 * 60)).toBe('03:00');
    expect(formatQuestionValue(2, 7.5)).toBe('7,5 ч');
  });

  test('pairs visible option labels with scoring values', () => {
    expect(getQuestionOptions(4)).toEqual([
      { label: 'Утро', value: 'morning' },
      { label: 'День', value: 'day' },
      { label: 'Вечер', value: 'evening' },
      { label: 'Ночь', value: 'night' },
      { label: 'Пика нет', value: 'none' },
    ]);
  });

  test('recognizes only onboarding screens that contain questions', () => {
    expect(isQuestionnaireScreen(10)).toBe(false);
    expect(isQuestionnaireScreen(11)).toBe(true);
    expect(isQuestionnaireScreen(17)).toBe(true);
    expect(isQuestionnaireScreen(18)).toBe(false);
  });

  test('parses only valid questionnaire question parameters', () => {
    expect(parseQuestionnaireQuestionId('4')).toBe(4);
    expect(parseQuestionnaireQuestionId('16')).toBe(16);
    expect(parseQuestionnaireQuestionId('17')).toBeNull();
    expect(parseQuestionnaireQuestionId(['4'])).toBeNull();
  });

  test('builds stable routes for questionnaire boundaries and category changes', () => {
    expect(getQuestionnaireDestinationHref('before-questionnaire')).toEqual({
      pathname: '/onboarding/[step]',
      params: { step: '10' },
    });
    expect(getQuestionnaireDestinationHref({ id: 7, screen: 13 })).toEqual({
      pathname: '/onboarding/[step]',
      params: { question: '7', step: '13' },
    });
    expect(getQuestionnaireDestinationHref('complete')).toEqual({
      pathname: '/onboarding/[step]',
      params: { step: '18' },
    });
  });

  test('restores an explicitly persisted visible question', () => {
    expect(
      getQuestionnaireResumeDestination({ id: 5, screen: 12 }, { bedtimeMinutes: 23 * 60 }),
    ).toEqual({ id: 5, screen: 12 });
  });

  test('guards persisted completion when earlier answers are missing', () => {
    expect(getQuestionnaireResumeDestination('complete', { budgetMinutes: 15 })).toEqual({
      id: 1,
      screen: 11,
    });
  });

  test('restores the boundary before the questionnaire after backing out', () => {
    expect(getQuestionnaireResumeDestination('before-questionnaire', {})).toBe(
      'before-questionnaire',
    );
  });

  test('ignores a persisted cursor when its conditional question is hidden', () => {
    expect(
      getQuestionnaireResumeDestination(
        { id: 6, screen: 12 },
        { caffeineServings: 'none', lastCaffeineMinutes: null },
      ),
    ).toEqual({ id: 1, screen: 11 });
  });
});
