import { computeNotificationPlan, nextEveningOccurrence } from './plan';

describe('computeNotificationPlan', () => {
  test('sends morning and evening pushes for an active user with an open task', () => {
    expect(computeNotificationPlan({ hourNow: 12, coreDoneToday: false, inactiveDays: 0 })).toEqual(
      { morning: 'daily', eveningTonight: true },
    );
  });

  test('no evening push once the core task is done today', () => {
    expect(computeNotificationPlan({ hourNow: 12, coreDoneToday: true, inactiveDays: 0 })).toEqual({
      morning: 'daily',
      eveningTonight: false,
    });
  });

  test('no evening push after 21:00 — nothing fires at night', () => {
    expect(computeNotificationPlan({ hourNow: 21, coreDoneToday: false, inactiveDays: 0 })).toEqual(
      { morning: 'daily', eveningTonight: false },
    );
  });

  test('three inactive days drop the evening push, seven days leave a weekly push only', () => {
    expect(computeNotificationPlan({ hourNow: 12, coreDoneToday: false, inactiveDays: 3 })).toEqual(
      { morning: 'daily', eveningTonight: false },
    );
    expect(computeNotificationPlan({ hourNow: 12, coreDoneToday: false, inactiveDays: 7 })).toEqual(
      { morning: 'weekly', eveningTonight: false },
    );
  });
});

describe('nextEveningOccurrence', () => {
  test('points to tonight before 21:00 and to tomorrow after', () => {
    const morning = new Date(2026, 7, 26, 9, 30);
    const tonight = nextEveningOccurrence(9, morning);

    expect([tonight.getHours(), tonight.getDate()]).toEqual([21, 26]);

    const late = new Date(2026, 7, 26, 22, 0);
    const tomorrow = nextEveningOccurrence(22, late);

    expect([tomorrow.getHours(), tomorrow.getDate()]).toEqual([21, 27]);
  });
});
