export const motion = {
  light: {
    appear: { duration: 400, easing: 'ease-out' },
    recede: { duration: 250, easing: 'ease-in' },
  },
  completion: {
    up: { duration: 180, easing: 'ease-out' },
    down: { duration: 320, easing: 'ease-in' },
  },
  screen: {
    duration: 240,
    offsetY: 12,
    easing: [0.16, 1, 0.3, 1],
  },
  ring: { duration: 900, stagger: 80, easing: 'ease-out' },
  progress: { duration: 400, easing: 'linear' },
} as const;
