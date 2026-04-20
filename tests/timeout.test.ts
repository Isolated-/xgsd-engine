import {timeout} from '../src/index.js'

describe('timeout', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('resolves before timeout', async () => {
    const promise = timeout(1000, async () => 'done')

    await expect(promise).resolves.toBe('done')
  })

  test('rejects after timeout', async () => {
    const promise = timeout(1000, async () => {
      return new Promise(() => {}) // never resolves
    })

    jest.advanceTimersByTime(1000)

    await expect(promise).rejects.toThrow('Timeout')
  })

  test('propagates task errors', async () => {
    const promise = timeout(1000, async () => {
      throw new Error('fail')
    })

    await expect(promise).rejects.toThrow('fail')
  })

  test('handles immediate resolution safely', async () => {
    const result = await timeout(1000, async () => 1)
    expect(result).toBe(1)
  })
})
