import {timeout} from './timeout'
import {SourceData} from './types/data'
import {RunFn} from './types/run'
import {DEFAULT_ERROR_MESSAGE, DEFAULT_ERROR_NAME, DEFAULT_ERROR_STACK, WrappedError} from './types/wrapped-error'

// move this when core is imported
export function normalizeError<E extends WrappedError = WrappedError>(error: unknown): E {
  // default fallback (covers null/undefined/non-object)
  let wrapped: WrappedError = {
    original: error,
    name: DEFAULT_ERROR_NAME,
    message: DEFAULT_ERROR_MESSAGE,
    stack: DEFAULT_ERROR_STACK,
  }

  // object-like errors (typical case: Error instances)
  if (typeof error === 'object' && error !== null) {
    const err = error as any

    wrapped = {
      original: error,
      name: err.name || 'Error',
      message: err.message || 'No message provided',
      stack: err.stack || 'No stack available',
    }
  }

  // string errors (yes, people still throw these…)
  if (typeof error === 'string') {
    wrapped = {
      original: error,
      name: error,
      message: error,
      stack: 'unknown',
    }
  }

  return wrapped as E
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
export async function execute<
  T extends SourceData = SourceData,
  R extends SourceData = SourceData,
  E extends WrappedError = WrappedError,
>(data: T, fn: RunFn<T, R>, ms?: number): Promise<{data: R | null; error: E | null}> {
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
