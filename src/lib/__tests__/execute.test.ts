import {execute, normalizeError} from '../execute'
import {DEFAULT_ERROR_MESSAGE, DEFAULT_ERROR_NAME, DEFAULT_ERROR_STACK} from '../types/wrapped-error'

describe('normalizeError', () => {
  test('normalizes Error instances correctly', () => {
    const error = new Error('Something failed')

    const result = normalizeError(error)

    expect(result.name).toBe('Error')
    expect(result.message).toBe('Something failed')
    expect(result.stack).toBeDefined()
    expect(result.original).toBe(error)
  })

  test('handles custom Error objects with name override', () => {
    const error = new Error('Boom')
    error.name = 'CustomError'

    const result = normalizeError(error)

    expect(result.name).toBe('CustomError')
    expect(result.message).toBe('Boom')
    expect(result.original).toBe(error)
  })

  test('handles string errors', () => {
    const result = normalizeError('Something broke')

    expect(result.name).toBe('Something broke')
    expect(result.message).toBe('Something broke')
    expect(result.stack).toBe('unknown')
    expect(result.original).toBe('Something broke')
  })

  test('handles null', () => {
    const result = normalizeError(null)

    expect(result.name).toBe('UnknownError')
    expect(result.message).toBe('Unknown error')
    expect(result.stack).toBe('unknown')
    expect(result.original).toBeNull()
  })

  test('handles undefined', () => {
    const result = normalizeError(undefined)

    expect(result.name).toBe('UnknownError')
    expect(result.message).toBe('Unknown error')
    expect(result.original).toBeUndefined()
  })

  test('handles non-error objects', () => {
    const result = normalizeError({foo: 'bar'})

    expect(result.name).toBe('Error')
    expect(result.message).toBe('No message provided')
    expect(result.stack).toBe('No stack available')
    expect(result.original).toEqual({foo: 'bar'})
  })

  test('falls back when partial error fields are missing', () => {
    const result = normalizeError({message: 'partial'})

    expect(result.name).toBe('Error')
    expect(result.message).toBe('partial')
    expect(result.stack).toBe('No stack available')
  })
})

/**
 *  execute() - execute fn with error handler/wrapper
 *  no child processes, workers, or isolation - see runner()
 *  @note T and R must extend SourceData
 */
describe('execute() - execute fn with error handler/wrapper', () => {
  test('should call the internal function with the correct argument', () => {
    const mockFn = jest.fn(async (data: number, signal?: AbortSignal) => data + 1)
    execute(1, mockFn)
    expect(mockFn).toHaveBeenCalledWith(1)
  })

  test('should call the internal function exactly once (success path)', () => {
    const mockFn = jest.fn(async (data: number) => data + 1)
    execute(1, mockFn)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  test('should return the result when successful', async () => {
    const mockFn = jest.fn(async (data: number) => data + 1)

    const result = await execute(1, mockFn)
    expect(result.data).toBe(2)
    expect(result.error).toBeNull()
  })

  test('should handle any data type', async () => {
    const fn = jest.fn(async (data: any) => data)
    let result = await execute('string', fn)
    expect(result.data).toBe('string')
    expect(result.error).toBeNull()

    result = await execute(1, fn)
    expect(result.data).toBe(1)
    expect(result.error).toBeNull()

    result = await execute(true, fn)
    expect(result.data).toBe(true)
    expect(result.error).toBeNull()

    result = await execute(1, fn)
    expect(result.data).toBe(1)
    expect(result.error).toBeNull()

    result = await execute(true, fn)
    expect(result.data).toBe(true)
    expect(result.error).toBeNull()

    result = await execute([1, 2, 3], fn)
    expect(result.data).toEqual([1, 2, 3])
    expect(result.error).toBeNull()

    result = await execute(null, fn)
    expect(result.data).toBeNull()
    expect(result.error).toBeNull()

    result = await execute(undefined, fn)
    expect(result.data).toBeUndefined()
    expect(result.error).toBeNull()
  })

  test('should catch and wrap internal error correctly', async () => {
    const fn = jest.fn(async (data: number) => {
      throw new Error('Internal error')
    })

    const fn2 = jest.fn(async (data: number) => {
      throw 'message'
    })

    const fn3 = jest.fn(async (data: number) => {
      throw {message: 'Internal error'}
    })

    const fn4 = jest.fn(async (data: number) => {
      throw data
    })

    const result = await execute(1, fn)
    expect(result.error).toBeInstanceOf(Object)
    expect(result.error?.name).toBe('Error')
    expect(result.error?.message).toBe('Internal error')
    expect(result.error?.stack).toBeDefined()

    const result2 = await execute(1, fn2)
    expect(result2.error).toBeInstanceOf(Object)
    expect(result2.error?.message).toBe('message')

    const result3 = await execute(1, fn3)
    expect(result3.error).toBeInstanceOf(Object)
    expect(result3.error?.message).toBe('Internal error')

    const result4 = await execute(1, fn4)
    expect(result4.error).toBeInstanceOf(Object)
    expect(result4.error?.original).toEqual(1)
    expect(result4.error?.name).toBe(DEFAULT_ERROR_NAME)
    expect(result4.error?.message).toBe(DEFAULT_ERROR_MESSAGE)
    expect(result4.error?.stack).toBe(DEFAULT_ERROR_STACK)
  })
})
