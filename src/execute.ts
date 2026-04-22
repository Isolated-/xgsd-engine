import {normaliseError} from './error.js'
import {timeout} from './timeout.js'
import {SourceData} from './types/data.js'
import {RunFn} from './types/run.js'
import {WrappedError} from './types/wrapped-error.js'

/**
 *  entry point for executing RunFn for both internal
 *  and usercode use. Ensure that this is called
 *  from within the child process, as this function
 *  doesn't isolate through workers/processes.
 *  @param {T} data
 *  @param {RunFn<T>} fn a runnable function in the shape of (data) => T
 *  @param {number} ms amount of miliseconds to delay for
 *  @returns data if successful or error if not, data will be null on error
 *  @note T and R must extend SourceData
 *  @note simplified when importing to @xgsd/engine
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
      error: normaliseError<E>(error),
    }
  }
}
