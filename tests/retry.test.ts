import {retry, RetryAttempt, SourceData, withTimeout} from '../src/index.js'

const backoff = (attempt: number) => 0

describe('retry() - retry logic above execute()', () => {
  test('when retries = 1 then delay = 0', async () => {
    const mockFn = jest.fn(async () => {
      throw new Error('Fail')
    })

    await retry({data: 1}, mockFn, 1, {
      backoff,
      onAttempt: (a) => {
        expect(a.nextMs).toEqual(0)
      },
    })
  })

  test('should return null after exhausting all retries', async () => {
    const mockFn = jest.fn(async () => {
      throw new Error('Fail')
    })

    const result = await retry({data: 1}, mockFn, 3, {backoff})

    expect(mockFn).toHaveBeenCalledTimes(3)
    expect(result.data).toBeNull()
    expect(result.error).toEqual(expect.any(Object))
  })

  test('should return error: null on success', async () => {
    const mockFn = jest.fn(async (data) => data)
    const backoff = jest.fn()
    const result = await retry({data: 1}, mockFn, 3, {backoff})
    expect(result.data).toEqual({data: 1})
    expect(result.error).toBeNull()

    // doesn't call backoff
    expect(backoff).not.toHaveBeenCalled()
  })

  test('should allow a custom timeout method to be passed in', async () => {
    const timeoutWrapper = withTimeout<SourceData>(1)

    const mockFn = jest.fn(() => new Promise(() => {})) as any // never resolves

    const onAttempt = jest.fn()

    const result = await retry({data: 1}, mockFn, 1, {
      onAttempt,
      timeoutWrapper,
    })

    // function should have been attempted 3 times
    expect(mockFn).toHaveBeenCalledTimes(1)

    // onAttempt should be called for each failed attempt
    expect(onAttempt).toHaveBeenCalledTimes(1)

    // final result should be an error
    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()

    // sanity check: error should be timeout-related
    expect(result.error?.message).toBe('Timeout')

    // optional: validate onAttempt payload shape
    expect(onAttempt).toHaveBeenLastCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Timeout',
        }),
        finalAttempt: true,
        attempt: 0,
      }),
    )
  })

  test('should call onAttempt with correct parameters', async () => {
    const mockFn = jest.fn(async () => {
      throw new Error('Fail')
    })

    const onAttempt = jest.fn()

    await retry({data: 1}, mockFn, 3, {onAttempt, backoff})

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

    await retry({data: 1}, mockFn, 3, {backoff})

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

    await retry({data: 1}, mockFn, 3, {backoff, onAttempt})

    expect(onAttempt).toHaveBeenCalledTimes(3)
  })

  test('should mark finalAttempt correctly on last retry', async () => {
    const mockFn = jest.fn(async () => {
      throw new Error('Fail')
    })

    const onAttempt = jest.fn()

    await retry({data: 1}, mockFn, 3, {onAttempt, backoff})

    const lastCall = onAttempt.mock.calls[2][0] as RetryAttempt

    expect(lastCall.finalAttempt).toBe(true)
    expect(lastCall.attempt).toBe(2)
  })
})
