import {
  getManifestoAudioPolicy,
  getManifestoLineCues,
  getVisibleManifestoLineCount,
  isManifestoActionVisible,
  manifestoScreens,
  manifestoScreenOneLineCuesMs,
  shouldStartManifestoAudio,
  splitManifestoBody,
} from './manifesto';

describe('manifesto screen configuration', () => {
  test('maps screens 1–10 to their required presentations', () => {
    expect(manifestoScreens).toEqual([
      { step: 1, presentation: 'narrative' },
      { step: 2, presentation: 'cycle' },
      { step: 3, presentation: 'broken-cycle' },
      { step: 4, presentation: 'positive-list' },
      { step: 5, presentation: 'negative-list' },
      { step: 6, presentation: 'categories' },
      { step: 7, presentation: 'statement' },
      { step: 8, presentation: 'grace-graph' },
      { step: 9, presentation: 'statement' },
      { step: 10, presentation: 'commit' },
    ]);
  });

  test('reveals one line immediately and another every 400ms', () => {
    expect(getVisibleManifestoLineCount({ elapsedMs: -1, lineCount: 5 })).toBe(1);
    expect(getVisibleManifestoLineCount({ elapsedMs: 0, lineCount: 5 })).toBe(1);
    expect(getVisibleManifestoLineCount({ elapsedMs: 399, lineCount: 5 })).toBe(1);
    expect(getVisibleManifestoLineCount({ elapsedMs: 400, lineCount: 5 })).toBe(2);
    expect(getVisibleManifestoLineCount({ elapsedMs: 1_599, lineCount: 5 })).toBe(4);
    expect(getVisibleManifestoLineCount({ elapsedMs: 1_600, lineCount: 5 })).toBe(5);
    expect(getVisibleManifestoLineCount({ elapsedMs: 10_000, lineCount: 5 })).toBe(5);
    expect(getVisibleManifestoLineCount({ elapsedMs: 0, lineCount: 0 })).toBe(0);
  });

  test('shows the complete state immediately when reduced motion is enabled', () => {
    expect(getVisibleManifestoLineCount({ elapsedMs: 0, lineCount: 8, reducedMotion: true })).toBe(
      8,
    );
    expect(isManifestoActionVisible(0, true)).toBe(true);
  });

  test('shows the primary action at four seconds rather than after the text', () => {
    expect(isManifestoActionVisible(3_999, false)).toBe(false);
    expect(isManifestoActionVisible(4_000, false)).toBe(true);
  });

  test('reveals embedded newlines as individual visual lines', () => {
    expect(splitManifestoBody(['Первая строка.\nВторая строка.', 'Третья строка.'])).toEqual([
      'Первая строка.',
      'Вторая строка.',
      'Третья строка.',
    ]);
  });

  test('preloads only screen 1 audio and lets silent mode suppress playback', () => {
    expect(getManifestoAudioPolicy(1)).toEqual({
      controlVisibleAtMs: 0,
      downloadFirst: true,
      playsInSilentMode: false,
    });
    expect(getManifestoAudioPolicy(2)).toBeNull();
  });

  test('starts audio once only after the mode and asset are both ready', () => {
    expect(
      shouldStartManifestoAudio({ modeConfigured: false, sourceLoaded: true, started: false }),
    ).toBe(false);
    expect(
      shouldStartManifestoAudio({ modeConfigured: true, sourceLoaded: false, started: false }),
    ).toBe(false);
    expect(
      shouldStartManifestoAudio({ modeConfigured: true, sourceLoaded: true, started: true }),
    ).toBe(false);
    expect(
      shouldStartManifestoAudio({ modeConfigured: true, sourceLoaded: true, started: false }),
    ).toBe(true);
  });

  test('keeps screen 1 text synchronized with narration past the four-second action', () => {
    expect(manifestoScreenOneLineCuesMs).toEqual([
      0, 2_368, 6_431, 11_336, 16_578, 19_883, 22_563, 24_918,
    ]);

    const lineCuesMs = getManifestoLineCues(1, 8);

    expect(getVisibleManifestoLineCount({ elapsedMs: 4_000, lineCount: 8, lineCuesMs })).toBe(2);
    expect(isManifestoActionVisible(4_000)).toBe(true);
    expect(getVisibleManifestoLineCount({ elapsedMs: 24_918, lineCount: 8, lineCuesMs })).toBe(8);
  });

  test('uses a 400ms cadence on manifesto screens without narration', () => {
    expect(getManifestoLineCues(4, 4)).toEqual([0, 400, 800, 1_200]);
  });
});
