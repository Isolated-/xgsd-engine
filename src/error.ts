import {WrappedError, DEFAULT_ERROR_NAME, DEFAULT_ERROR_MESSAGE, DEFAULT_ERROR_STACK} from './types/wrapped-error.js'

export function normaliseError<E extends WrappedError = WrappedError>(error: unknown): E {
  // null / undefined
  if (error === null) {
    return {
      original: null,
      name: DEFAULT_ERROR_NAME,
      message: DEFAULT_ERROR_MESSAGE,
      stack: DEFAULT_ERROR_STACK,
    } as E
  }

  if (error === undefined) {
    return {
      original: undefined,
      name: DEFAULT_ERROR_NAME,
      message: DEFAULT_ERROR_MESSAGE,
      stack: DEFAULT_ERROR_STACK,
    } as E
  }

  // string errors
  if (typeof error === 'string') {
    return {
      original: error,
      name: error,
      message: error,
      stack: 'unknown',
    } as E
  }

  // object-like errors
  if (typeof error === 'object') {
    const err = error as any

    const message = typeof err.message === 'string' ? err.message : 'No message provided'

    const name = typeof err.name === 'string' ? err.name : 'Error'

    const stack = typeof err.stack === 'string' ? err.stack : 'No stack available'

    return {
      original: error,
      name,
      message,
      stack,
    } as E
  }

  // fallback (numbers, symbols, etc.)
  return {
    original: error,
    name: DEFAULT_ERROR_NAME,
    message: DEFAULT_ERROR_MESSAGE,
    stack: DEFAULT_ERROR_STACK,
  } as E
}
