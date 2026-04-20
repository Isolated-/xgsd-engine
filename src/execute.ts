import {timeout} from './timeout.js'
import {SourceData} from './types/data.js'
import {RunFn} from './types/run.js'
import {DEFAULT_ERROR_MESSAGE, DEFAULT_ERROR_NAME, DEFAULT_ERROR_STACK, WrappedError} from './types/wrapped-error.js'

// move this when core is imported
export function normalizeError<E extends WrappedError = WrappedError>(error: unknown): E {
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

/**
 *  entry point for executing RunFn for both internal
 *  and usercode use. Ensure that this is called
 *  from within the child process, as this function
 *  doesn't isolate through workers/processes.
 *  @param {T} data
 *  @param {RunFn<T, R>} fn
 *  @returns
 *  @note T and R must extend SourceData
 *  @note simplified when importing to @xgsd/core
 *  (no longer uses transformer() or ms library)
 */
export async function execute<T extends SourceData = SourceData, E extends WrappedError = WrappedError>(
  data: T,
  fn: RunFn<T>,
  ms?: number,
): Promise<{data: T | null; error: E | null}> {
  try {
    const result = await timeout(ms || 100, () => fn(data))

    return {
      data: result,
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error: normalizeError<E>(error),
    }
  }
}
