import { applyMiss, getGraceStatus, type GraceState } from './grace';

const initialState: GraceState = {
  chainLength: 12,
  usedAt: [],
  downgradeOffered: false,
};

function isoDay(dayOffset: number) {
  return new Date(Date.UTC(2026, 0, 1 + dayOffset)).toISOString().slice(0, 10);
}

describe('rolling grace days', () => {
  test('consumes an available grace day automatically without changing the chain', () => {
    expect(applyMiss(initialState, '2026-08-14')).toEqual({
      chainLength: 12,
      usedAt: ['2026-08-14'],
      downgradeOffered: false,
      graceDaysLeft: 1,
      graceUsed: true,
    });
  });

  test('restores capacity when a use leaves the rolling thirty-day window', () => {
    const state: GraceState = {
      chainLength: 20,
      usedAt: ['2026-08-01', '2026-08-15'],
      downgradeOffered: false,
    };

    expect(getGraceStatus(state, '2026-08-31')).toEqual({
      activeUses: ['2026-08-15'],
      graceDaysLeft: 1,
    });
    expect(applyMiss(state, '2026-08-31')).toEqual({
      chainLength: 20,
      usedAt: ['2026-08-15', '2026-08-31'],
      downgradeOffered: false,
      graceDaysLeft: 0,
      graceUsed: true,
    });
  });

  test('offers a downgrade after exhaustion but keeps the chain intact', () => {
    expect(
      applyMiss(
        {
          chainLength: 9,
          usedAt: ['2026-08-01', '2026-08-10'],
          downgradeOffered: false,
        },
        '2026-08-14',
      ),
    ).toEqual({
      chainLength: 9,
      usedAt: ['2026-08-01', '2026-08-10'],
      downgradeOffered: true,
      graceDaysLeft: 0,
      graceUsed: false,
    });
  });

  test('never resets chainLength under any sequence of misses', () => {
    let state: GraceState = { ...initialState, chainLength: 37 };

    for (let day = 0; day < 60; day += 1) {
      state = applyMiss(state, isoDay(day));
      expect(state.chainLength).toBe(37);
    }
  });
});
