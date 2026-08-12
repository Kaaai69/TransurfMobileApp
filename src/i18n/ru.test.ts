import { ru } from './ru';

const decodeBase64 = (value: string) => Buffer.from(value, 'base64').toString('utf8');

describe('Russian copy contract', () => {
  test('covers the complete onboarding flow and honest question count', () => {
    expect(Object.keys(ru.onboarding.screens)).toHaveLength(22);
    expect(ru.onboarding.questions).toHaveLength(16);
    expect(ru.onboarding.totalQuestions).toBe(16);
    expect(ru.onboarding.progress(7)).toBe('7 / 16');
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

  test('keeps milestones limited to their approved user-facing copy', () => {
    expect(ru.milestones).toEqual({
      3: {
        title: decodeBase64('0KLRgNC10YLQuNC5INC00LXQvdGMLiDQntCx0YvRh9C90L4g0LfQtNC10YHRjCDRgdGC0LDQvdC+0LLQuNGC0YHRjyDRgdC60YPRh9C90L4u'),
        body: [
          decodeBase64('0K3RgtC+INC90L7RgNC80LDQu9GM0L3QviDQuCDRjdGC0L4g0L3QtSDQv9GA0L4g0LLQsNGBLiDQn9GA0LjQstGL0YfQutCwINGB0YLQsNC90L7QstC40YLRgdGPINCw0LLRgtC+0LzQsNGC0LjRh9C10YHQutC+0Lkg0LIg0YHRgNC10LTQvdC10Lwg0LfQsCA2NiDQtNC90LXQuSDigJQg0YHQtdC50YfQsNGBINC40LTRkdGCINGH0LXRgtCy0ZHRgNGC0YvQuS4='),
          decodeBase64('TGFsbHkgZXQgYWwuLCAyMDEw'),
        ],
      },
      7: {
        title: decodeBase64('0J3QtdC00LXQu9GPLiDQn9C10YDQtdGB0YfQuNGC0LDQu9C4Lg=='),
        body: [
          decodeBase64('0JIg0L/QtdGA0LLRi9C5INC00LXQvdGMINGH0LjRgdC70LAg0LHRi9C70Lgg0L/QvtGB0YLRgNC+0LXQvdGLINC90LAg0LLQsNGI0LjRhSDQvtGC0LLQtdGC0LDRhS4g0KLQtdC/0LXRgNGMIOKAlCDQvdCwINGC0L7QvCwg0YfRgtC+INCy0Ysg0LTQtdC70LDQu9C4Lg=='),
        ],
      },
      11: {
        title: decodeBase64('0JLRh9C10YDQsCDQv9GA0L7Qv9GD0YHRgtC40LvQuC4='),
        body: [
          decodeBase64('0JjRgdC/0L7Qu9GM0LfQvtCy0LDQu9C4INC/0YDQvtGJ0ZHQvdC90YvQuSDQtNC10L3RjC4g0J7RgdGC0LDQu9C+0YHRjCAxINC40LcgMi4K0KbQtdC/0L7Rh9C60LAg0YbQtdC70LAsINC90LjRh9C10LPQviDQvdC1INGB0LPQvtGA0LXQu9C+Lg=='),
          decodeBase64('0JIg0LjRgdGB0LvQtdC00L7QstCw0L3QuNC4LCDQvdCwINC60L7RgtC+0YDQvtC8INGN0YLQviDQv9C+0YHRgtGA0L7QtdC90L4sINC/0YDQvtC/0YPRgdC6INC+0LTQvdC+0LPQviDQtNC90Y8g0L3QtSDQstC70LjRj9C7INC90LAg0YTQvtGA0LzQuNGA0L7QstCw0L3QuNC1INC/0YDQuNCy0YvRh9C60LguCkxhbGx5IGV0IGFsLiwgMjAxMA=='),
          decodeBase64('0KHQtdCz0L7QtNC90Y8g4oCUINC60LDQuiDQvtCx0YvRh9C90L4u'),
        ],
      },
      14: {
        title: decodeBase64('0JTQstC1INC90LXQtNC10LvQuC4='),
        body: [
          decodeBase64('0J7RgdGC0LDQu9GM0L3QvtC1INC/0L7Rh9GC0Lgg0L3QtSDQtNCy0LjQvdGD0LvQvtGB0Ywg4oCUINGC0LDQuiDQuCDQtNC+0LvQttC90L4g0LHRi9GC0YwuINCc0Ysg0YDQsNCx0L7RgtCw0LvQuCDQvdCw0LQg0L7QtNC90LjQvC4='),
          decodeBase64('0JfQsNC00LDRh9CwINC00LXRgNC20LjRgtGB0Y8g0LTQvtGB0YLQsNGC0L7Rh9C90L4sINGH0YLQvtCx0Ysg0LjQtNGC0Lgg0LTQsNC70YzRiNC1Lg=='),
        ],
        primaryAction: decodeBase64('0JHQtdGA0YMg0YHQu9C10LTRg9GO0YnRg9GO'),
        secondaryAction: decodeBase64('0J7RgdGC0LDRgtGM0YHRjyDQvdCwINGN0YLQvtC5INC10YnRkSDQvdCwINC90LXQtNC10LvRjg=='),
      },
    });
  });
});
