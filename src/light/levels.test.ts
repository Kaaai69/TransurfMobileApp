import { glowForms, glowLevels, resolveGlowGeometry, resolveGlowPalette } from './levels';

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

  test('bloom anchors its gradient at the bottom geometry and preserves its elliptical falloff', () => {
    const bloom = resolveGlowGeometry('L4', 'bloom');

    expect(bloom.gradient).toMatchObject({
      cx: glowForms.bloom.cx,
      cy: glowForms.bloom.cy,
      r: glowForms.bloom.rx + glowLevels.L4.blur,
    });
    expect(bloom.gradient.transform).toContain(
      `translate(${glowForms.bloom.cx} ${glowForms.bloom.cy})`,
    );
  });

  test('each visible level supplies its blur to the rendered falloff geometry', () => {
    const visible = ['L1', 'L2', 'L3', 'L4', 'L5'] as const;

    expect(visible.map((level) => resolveGlowGeometry(level, 'halo').filter.stdDeviation)).toEqual(
      visible.map((level) => glowLevels[level].blur),
    );
    expect(resolveGlowGeometry('L1', 'halo').gradient.r).toBeGreaterThan(
      resolveGlowGeometry('L5', 'halo').gradient.r,
    );
  });

  test('edge keeps its outline visible and reserves unclipped outer falloff bounds', () => {
    const edge = resolveGlowGeometry('L4', 'edge');
    const edgeCornerDistance = Math.hypot(glowForms.edge.width / 2, glowForms.edge.height / 2);

    expect(edge.gradient.r).toBeGreaterThan(edgeCornerDistance);
    expect(edge.filter).toMatchObject({
      x: glowForms.edge.x - glowLevels.L4.blur,
      y: glowForms.edge.y - glowLevels.L4.blur,
      width: glowForms.edge.width + glowLevels.L4.blur * 2,
      height: glowForms.edge.height + glowLevels.L4.blur * 2,
    });
  });
});
