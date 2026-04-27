import {normaliseError} from '../src/error.js'

describe('normalizeError', () => {
  test('normalizes Error instances correctly', () => {
    const error = new Error('Something failed')

    const result = normaliseError(error)

    expect(result.name).toBe('Error')
    expect(result.message).toBe('Something failed')
    expect(result.stack).toBeDefined()
    expect(result.original).toBe(error)
  })

  test('handles custom Error objects with name override', () => {
    const error = new Error('Boom')
    error.name = 'CustomError'

    const result = normaliseError(error)

    expect(result.name).toBe('CustomError')
    expect(result.message).toBe('Boom')
    expect(result.original).toBe(error)
  })

  test('handles string errors', () => {
    const result = normaliseError('Something broke')

    expect(result.name).toBe('Something broke')
    expect(result.message).toBe('Something broke')
    expect(result.stack).toBe('unknown')
    expect(result.original).toBe('Something broke')
  })

  test('handles null', () => {
    const result = normaliseError(null)

    expect(result.name).toBe('UnknownError')
    expect(result.message).toBe('Unknown error')
    expect(result.stack).toBe('unknown')
    expect(result.original).toBeNull()
  })

  test('handles undefined', () => {
    const result = normaliseError(undefined)

    expect(result.name).toBe('UnknownError')
    expect(result.message).toBe('Unknown error')
    expect(result.original).toBeUndefined()
  })

  test('handles non-error objects', () => {
    const result = normaliseError({foo: 'bar'})

    expect(result.name).toBe('Error')
    // v0.1.2: treats object-like errors better
    expect(result.message).toBe(JSON.stringify({foo: 'bar'}))
    expect(result.stack).toBe('No stack available')
    expect(result.original).toEqual({foo: 'bar'})
  })

  test('handles non-error classes', () => {
    // doesn't implement/extend Error
    class NonErrorClass {
      constructor(public data: any) {}
    }

    const instance = new NonErrorClass({foo: 'bar'})
    const error = normaliseError(instance)
    expect(error.original).toEqual(instance)
  })

  test('falls back when partial error fields are missing', () => {
    const result = normaliseError({message: 'partial'})

    expect(result.name).toBe('Error')
    expect(result.message).toBe('partial')
    expect(result.stack).toBe('No stack available')
  })
})
