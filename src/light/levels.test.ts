import { glowLevels, resolveGlowPalette } from './levels';

describe('light scale', () => {
  test('L0 produces no visible palette', () => {
    expect(resolveGlowPalette('L0', 'cool')).toBeNull();
  });

  test('visible levels grow brighter while their falloff tightens', () => {
    const visible = ['L1', 'L2', 'L3', 'L4', 'L5'] as const;
    expect(visible.map((level) => glowLevels[level].alpha)).toEqual([0.08, 0.15, 0.25, 0.4, 0.55]);
    expect(visible.map((level) => glowLevels[level].blur)).toEqual([60, 48, 36, 24, 16]);
  });

  test('a category override changes the halo but not the light core', () => {
    expect(resolveGlowPalette('L4', 'cool', '#8B7BFF')).toMatchObject({
      core: '#F0F2FF',
      halo: '#8B7BFF',
      alpha: 0.4,
    });
  });
});
