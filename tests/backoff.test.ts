import {
  linearBackoff,
  squaringBackoff,
  exponentialBackoff,
  manualBackoff,
  strategyMap,
  getBackoffStrategy,
} from '../src/index.js'

describe('backoff strategies', () => {
  describe('linearBackoff', () => {
    test('returns base * attempt', () => {
      expect(linearBackoff(0, 1000)).toBe(0)
      expect(linearBackoff(1, 1000)).toBe(1000)
      expect(linearBackoff(2, 1000)).toBe(2000)
    })

    test('uses default base', () => {
      expect(linearBackoff(2)).toBe(2000)
    })
  })

  describe('squaringBackoff', () => {
    test('returns base * attempt^2', () => {
      expect(squaringBackoff(0, 1000)).toBe(0)
      expect(squaringBackoff(1, 1000)).toBe(1000)
      expect(squaringBackoff(2, 1000)).toBe(4000)
      expect(squaringBackoff(3, 1000)).toBe(9000)
    })

    test('uses default base', () => {
      expect(squaringBackoff(2)).toBe(4000)
    })
  })

  describe('exponentialBackoff', () => {
    test('returns base * 2^attempt', () => {
      expect(exponentialBackoff(0, 1000)).toBe(1000)
      expect(exponentialBackoff(1, 1000)).toBe(2000)
      expect(exponentialBackoff(2, 1000)).toBe(4000)
      expect(exponentialBackoff(3, 1000)).toBe(8000)
    })

    test('uses default base', () => {
      expect(exponentialBackoff(2)).toBe(4000)
    })
  })

  describe('manualBackoff', () => {
    test('always returns base regardless of attempt', () => {
      expect(manualBackoff(0, 1000)).toBe(1000)
      expect(manualBackoff(5, 1000)).toBe(1000)
      expect(manualBackoff(999, 1000)).toBe(1000)
    })

    test('uses default base', () => {
      expect(manualBackoff(10)).toBe(1000)
    })
  })
})

describe('strategyMap', () => {
  test('contains all expected strategies', () => {
    expect(strategyMap.linear).toBe(linearBackoff)
    expect(strategyMap.squaring).toBe(squaringBackoff)
    expect(strategyMap.exponential).toBe(exponentialBackoff)
    expect(strategyMap.manual).toBe(manualBackoff)
  })
})

describe('getBackoffStrategy', () => {
  test('returns correct strategy by name', () => {
    expect(getBackoffStrategy('linear')).toBe(linearBackoff)
    expect(getBackoffStrategy('squaring')).toBe(squaringBackoff)
    expect(getBackoffStrategy('exponential')).toBe(exponentialBackoff)
    expect(getBackoffStrategy('manual')).toBe(manualBackoff)
  })

  test('falls back to exponential for unknown strategy', () => {
    expect(getBackoffStrategy('unknown')).toBe(exponentialBackoff)
    expect(getBackoffStrategy('')).toBe(exponentialBackoff)
  })
})
