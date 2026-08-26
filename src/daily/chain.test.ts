import { processMissedDays, resolveGraceDaysLeft, sanitizeChainState } from './chain';

const empty = sanitizeChainState(undefined);

describe('processMissedDays', () => {
  test('consumes one grace day per missed day and keeps the chain intact', () => {
    const { chain, newlyForgiven } = processMissedDays(empty, ['2026-08-20', '2026-08-21']);

    expect(newlyForgiven).toEqual(['2026-08-20', '2026-08-21']);
    expect(chain.usedAt).toEqual(['2026-08-20', '2026-08-21']);
    expect(chain.downgradeOffered).toBe(false);
    expect(resolveGraceDaysLeft(chain, '2026-08-22')).toBe(0);
  });

  test('a third miss offers a downgrade but never resets anything', () => {
    const afterTwo = processMissedDays(empty, ['2026-08-10', '2026-08-11']).chain;
    const afterThree = processMissedDays(afterTwo, ['2026-08-12']);

    expect(afterThree.chain.downgradeOffered).toBe(true);
    expect(resolveGraceDaysLeft(afterThree.chain, '2026-08-12')).toBe(0);
  });

  test('grace days restore through the rolling 30-day window', () => {
    const { chain } = processMissedDays(empty, ['2026-07-01', '2026-07-02']);

    expect(resolveGraceDaysLeft(chain, '2026-07-15')).toBe(0);
    expect(resolveGraceDaysLeft(chain, '2026-07-31')).toBe(1);
    expect(resolveGraceDaysLeft(chain, '2026-08-01')).toBe(2);
  });

  test('already processed misses are never consumed twice', () => {
    const first = processMissedDays(empty, ['2026-08-05']);
    const second = processMissedDays(first.chain, ['2026-08-05']);

    expect(second.newlyForgiven).toEqual([]);
    expect(second.chain.usedAt).toHaveLength(1);
  });
});
