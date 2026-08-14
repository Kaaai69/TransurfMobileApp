import { recalculateState, type StateValues } from './drift';

const baseline: StateValues = {
  sleep: 50,
  energy: 50,
  movement: 50,
  food: 50,
  water: 50,
  mind: 50,
};

describe('rolling state drift', () => {
  test('moves less after no entry than after an explicit skip', () => {
    const done = { date: '2026-08-13', category: 'sleep', slot: 'core', status: 'done' } as const;
    const afterDone = recalculateState({ baseline, events: [done], asOf: '2026-08-14' });
    const afterNoEntry = recalculateState({
      baseline,
      events: [done, { ...done, date: '2026-08-14', status: 'no_entry' }],
      asOf: '2026-08-14',
    });
    const afterSkipped = recalculateState({
      baseline,
      events: [done, { ...done, date: '2026-08-14', status: 'skipped' }],
      asOf: '2026-08-14',
    });

    expect(afterDone.sleep).toBe(52);
    expect(afterNoEntry.sleep).toBe(51.5);
    expect(afterSkipped.sleep).toBe(50);
    expect(afterDone.sleep - afterNoEntry.sleep).toBeLessThan(afterDone.sleep - afterSkipped.sleep);
  });

  test('applies weight 0.3 only to documented adjacent categories', () => {
    expect(
      recalculateState({
        baseline,
        events: [{ date: '2026-08-14', category: 'sleep', slot: 'core', status: 'done' }],
        asOf: '2026-08-14',
      }),
    ).toEqual({ sleep: 52, energy: 50.6, movement: 50, food: 50, water: 50, mind: 50.6 });
  });

  test('drifts toward baseline from either direction', () => {
    const result = recalculateState({
      baseline,
      events: [
        { date: '2026-08-11', category: 'sleep', slot: 'core', status: 'done' },
        { date: '2026-08-12', category: 'sleep', slot: 'core', status: 'no_entry' },
        { date: '2026-08-13', category: 'water', slot: 'core', status: 'skipped' },
        { date: '2026-08-14', category: 'water', slot: 'core', status: 'no_entry' },
      ],
      asOf: '2026-08-14',
    });

    expect(result.sleep).toBe(51.5);
    expect(result.water).toBe(48.5);
  });

  test('rebuilds from baseline using only the inclusive fourteen-day window', () => {
    const result = recalculateState({
      baseline,
      events: [
        { date: '2026-08-01', category: 'sleep', slot: 'core', status: 'done' },
        { date: '2026-08-02', category: 'sleep', slot: 'core', status: 'done' },
        { date: '2026-08-15', category: 'sleep', slot: 'core', status: 'done' },
      ],
      asOf: '2026-08-15',
    });

    expect(result.sleep).toBe(54);
  });
});
