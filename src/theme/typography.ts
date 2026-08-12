export const typography = {
  fonts: { regular: 'Inter_400Regular', medium: 'Inter_500Medium' },
  weights: { regular: 400, medium: 500 },
  manifesto: {
    fontSize: 30,
    lineHeight: 37.5,
    fontFamily: 'Inter_400Regular',
  },
  screenTitle: {
    fontSize: 24,
    lineHeight: 31.2,
    fontFamily: 'Inter_500Medium',
  },
  task: {
    fontSize: 17,
    lineHeight: 24.65,
    fontFamily: 'Inter_400Regular',
  },
  metric: {
    fontSize: 32,
    lineHeight: 32,
    fontFamily: 'Inter_400Regular',
    fontVariant: ['tabular-nums'],
  },
  body: {
    fontSize: 15,
    lineHeight: 23.25,
    fontFamily: 'Inter_400Regular',
  },
  caption: {
    fontSize: 13,
    lineHeight: 19.5,
    fontFamily: 'Inter_400Regular',
  },
  label: {
    fontSize: 11,
    lineHeight: 13.2,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
} as const;
