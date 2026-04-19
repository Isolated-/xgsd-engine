import {retry} from '../retry'
import {RetryAttempt} from '../types/attempt'

const backoff = (attempt: number) => 0

describe('retry() - retry logic above execute()', () => {
  test('should return null after exhausting all retries', async () => {
    const mockFn = jest.fn(async () => {
      throw new Error('Fail')
    })

    const result = await retry(1, mockFn, 3, {backoff})

    expect(mockFn).toHaveBeenCalledTimes(3)
    expect(result.data).toBeNull()
    expect(result.error).toEqual(expect.any(Object))
  })

  test('should return error: null on success', async () => {
    const mockFn = jest.fn(async () => 1)
    const result = await retry(1, mockFn, 3)
    expect(result.data).toEqual(1)
    expect(result.error).toBeNull()
  })

  test('should call onAttempt with correct parameters', async () => {
    const mockFn = jest.fn(async () => {
      throw new Error('Fail')
    })

    const onAttempt = jest.fn()

    await retry(1, mockFn, 3, {onAttempt, backoff})

    expect(onAttempt).toHaveBeenCalledTimes(3)

    // attempt 0
    expect(onAttempt).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        attempt: 0,
        maxRetries: 3,
        error: expect.any(Object),
        finalAttempt: false,
        nextMs: 0,
      }),
    )

    // attempt 1
    expect(onAttempt).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        attempt: 1,
        maxRetries: 3,
        error: expect.any(Object),
        finalAttempt: false,
      }),
    )

    // attempt 2
    expect(onAttempt).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        attempt: 2,
        maxRetries: 3,
        error: expect.any(Object),
        finalAttempt: true,
      }),
    )
  })

  test('should call backoff function with correct attempt values', async () => {
    const mockFn = jest.fn(async () => {
      throw new Error('Fail')
    })

    const backoff = jest.fn((attempt: number) => attempt * 100)

    await retry(1, mockFn, 3, {backoff})

    expect(backoff).toHaveBeenCalledTimes(3)
    expect(backoff).toHaveBeenNthCalledWith(1, 0)
    expect(backoff).toHaveBeenNthCalledWith(2, 1)
    expect(backoff).toHaveBeenNthCalledWith(3, 2)
  })

  test('onAttempt should reflect computed nextMs from backoff()', async () => {
    const mockFn = jest.fn(async () => {
      throw new Error('Fail')
    })

    const backoff = jest.fn((attempt: number) => attempt * 100)

    const onAttempt = jest.fn((attempt: RetryAttempt) => {
      const expected = backoff(attempt.attempt)
      expect(attempt.nextMs).toBe(expected)
    })

    await retry(1, mockFn, 3, {backoff, onAttempt})

    expect(onAttempt).toHaveBeenCalledTimes(3)
  })

  test('should mark finalAttempt correctly on last retry', async () => {
    const mockFn = jest.fn(async () => {
      throw new Error('Fail')
    })

    const onAttempt = jest.fn()

    await retry(1, mockFn, 3, {onAttempt, backoff})

    const lastCall = onAttempt.mock.calls[2][0] as RetryAttempt

    expect(lastCall.finalAttempt).toBe(true)
    expect(lastCall.attempt).toBe(2)
  })
})
