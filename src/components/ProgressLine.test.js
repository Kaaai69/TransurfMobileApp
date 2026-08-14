/* global describe, expect, test */

const React = require('react');
const TestRenderer = require('react-test-renderer');

const { ProgressLine } = require('./ProgressLine');

describe('ProgressLine', () => {
  test('reports fractional progress to native accessibility as integer percent', () => {
    let renderer;

    TestRenderer.act(() => {
      renderer = TestRenderer.create(React.createElement(ProgressLine, { progress: 0.25 }));
    });

    const progressbar = renderer.root.find(
      ({ props }) => props.accessibilityRole === 'progressbar',
    );

    expect(progressbar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 25 });
  });
});
