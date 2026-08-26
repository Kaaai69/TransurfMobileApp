import { selectSourcesForProfile, sources, findSourceByDoi, doiUrl } from './sources';

const scores = {
  sleep: 34,
  energy: 41,
  movement: 28,
  food: 52,
  water: 46,
  mind: 30,
};

describe('source registry', () => {
  test('keeps the eleven documented sources and excludes sponsored water research from cards', () => {
    expect(sources).toHaveLength(10);
    expect(findSourceByDoi('10.1017/S0007114511002005')).toBeNull();
    expect(findSourceByDoi('10.1002/ejsp.674')).not.toBeNull();
    expect(doiUrl('10.1002/ejsp.674')).toBe('https://doi.org/10.1002/ejsp.674');
  });

  test('picks cards for the weakest categories first, without duplicates, within the limit', () => {
    const selected = selectSourcesForProfile(scores, 6);

    expect(selected).toHaveLength(6);
    expect(selected.map((source) => source.doi)).toEqual([
      '10.1136/bjsports-2020-102955',
      '10.1016/j.xcrm.2022.100895',
      '10.1093/sleep/26.2.117',
      '10.1016/j.cub.2013.06.039',
      '10.1186/s12916-017-0791-y',
      '10.1002/ejsp.674',
    ]);
  });

  test('never returns more cards than the limit even with a tiny limit', () => {
    expect(selectSourcesForProfile(scores, 2)).toHaveLength(2);
  });
});
