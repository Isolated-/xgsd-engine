import {execute} from '../src/execute.js'

/**
 *  execute() - execute fn with error handler/wrapper
 *  no child processes, workers, or isolation - see runner()
 *  @note T and R must extend SourceData
 *
 *  @note (20/04) dropped R from execute() as SourceData is now simplified
 *  these tests changed to update execute() usage
 */
describe('execute() - execute fn with error handler/wrapper', () => {
  test('should call the internal function with the correct argument', () => {
    const mockFn = jest.fn(async (data: Record<string, number>) => ({
      data: data.data + 1,
    }))

    execute({data: 1}, mockFn)

    // check the arguments
    expect(mockFn).toHaveBeenCalledWith({data: 1})
  })

  test('should call the internal function exactly once (success path)', () => {
    const mockFn = jest.fn(async (data: Record<string, number>) => ({
      data: data.data + 1,
    }))

    execute({data: 1}, mockFn)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  test('should return the result when successful', async () => {
    const mockFn = jest.fn(async (data: Record<string, number>) => ({
      data: data.data + 1,
    }))

    const result = await execute({data: 1}, mockFn)
    expect(result.data).toEqual({data: 2})
    expect(result.error).toBeNull()
  })

  test('should catch and wrap internal error correctly', async () => {
    const fn = jest.fn(async (data: {value: number}) => {
      throw new Error('Internal error')
    })

    const fn2 = jest.fn(async (data: {value: number}) => {
      throw 'message'
    })

    const fn3 = jest.fn(async (data: {value: number}) => {
      throw {message: 'Internal error'}
    })

    const fn4 = jest.fn(async (data: {value: number}) => {
      throw data.value
    })

    const input = {value: 1}

    const result = await execute(input, fn)

    expect(result.error?.name).toBe('Error')
    expect(result.error?.message).toBe('Internal error')
    expect(typeof result.error?.stack).toBe('string')

    const result2 = await execute(input, fn2)

    expect(result2.error?.name).toBe('message')
    expect(result2.error?.message).toBe('message')

    const result3 = await execute(input, fn3)

    expect(result3.error?.name).toBe('Error')
    expect(result3.error?.message).toBe('Internal error')

    const result4 = await execute(input, fn4)

    expect(result4.error?.name).toBe('UnknownError')
    expect(result4.error?.message).toBe('Unknown error')
    expect(result4.error?.original).toBe(1)
  })
})
