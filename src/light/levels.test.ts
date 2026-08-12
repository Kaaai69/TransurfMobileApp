import { glowLevels, resolveGlowPalette, resolveGlowRenderPlan } from './levels';

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

  test('bloom anchors its pixel gradient at the bottom of the measured layout', () => {
    const bloom = resolveGlowRenderPlan('L4', 'bloom', { width: 320, height: 640 });

    expect(bloom.gradient).toMatchObject({
      cx: bloom.viewport.padding + 160,
      cy: bloom.viewport.padding + 640,
    });
    expect(bloom.gradient.transform).toContain(
      `translate(${bloom.gradient.cx} ${bloom.gradient.cy})`,
    );
  });

  test('each visible level has a distinct Android-effective pixel falloff extent', () => {
    const visible = ['L1', 'L2', 'L3', 'L4', 'L5'] as const;
    const plans = visible.map((level) =>
      resolveGlowRenderPlan(level, 'halo', { width: 240, height: 120 }),
    );

    expect(plans.map((plan) => plan.falloff.extent)).toEqual(
      visible.map((level) => glowLevels[level].blur),
    );
    const falloffRadii = plans.map((plan) => {
      if (plan.falloff.geometry.shape !== 'circle') {
        throw new Error('Halo falloff must remain circular.');
      }

      return plan.falloff.geometry.r;
    });

    expect(new Set(falloffRadii).size).toBe(visible.length);
  });

  test('edge renders inside a padded pixel viewport with room for its exterior falloff', () => {
    const edge = resolveGlowRenderPlan('L4', 'edge', { width: 200, height: 100 });

    expect(edge.viewport).toMatchObject({
      padding: glowLevels.L4.blur,
      x: -glowLevels.L4.blur,
      y: -glowLevels.L4.blur,
      width: 200 + glowLevels.L4.blur * 2,
      height: 100 + glowLevels.L4.blur * 2,
    });
    expect(edge.geometry).toMatchObject({ x: glowLevels.L4.blur, y: glowLevels.L4.blur });
    expect(edge.falloff.geometry).toMatchObject({
      x: glowLevels.L4.blur / 2,
      y: glowLevels.L4.blur / 2,
      strokeWidth: glowLevels.L4.blur,
    });
  });

  test('a halo remains circular when the measured layout aspect ratio changes', () => {
    const wide = resolveGlowRenderPlan('L4', 'halo', { width: 240, height: 120 });
    const tall = resolveGlowRenderPlan('L4', 'halo', { width: 120, height: 240 });

    if (
      wide.geometry.shape !== 'circle' ||
      tall.geometry.shape !== 'circle' ||
      wide.falloff.geometry.shape !== 'circle' ||
      tall.falloff.geometry.shape !== 'circle'
    ) {
      throw new Error('Halo geometry must remain circular.');
    }

    expect(wide.geometry.r).toBe(tall.geometry.r);
    expect(wide.falloff.geometry.r).toBe(tall.falloff.geometry.r);
  });
});
