import {execute} from './execute'
import {RetryAttempt} from './types/attempt'
import {RunFn} from './types/run'
import {WrappedError} from './types/wrapped-error'

/**
 * Retry a function call with exponential backoff.
 * @param {T} data - The input data for the function.
 * @param {RunFn<T, R>} fn - The function to retry.
 * @param {number} retries - The number of retry attempts.
 * @param {object} opts - Options for the retry behavior.
 * @returns {Promise<R|null>} The result of the function call or null if all retries fail.
 */
export async function retry<T, R = T>(
  data: T,
  fn: RunFn<T, R>,
  retries: number,
  opts?: {
    timeout?: number
    backoff?: (attempt: number) => number
    onAttempt?: (attempt: RetryAttempt) => void
  },
) {
  let attempt = 0
  let finalError: WrappedError | null = null

  while (attempt < retries) {
    const execution = await execute<T, R, WrappedError>(data, fn, opts?.timeout)

    if (!execution.error) {
      return {data: execution.data, error: null}
    }

    const delay = opts?.backoff ? opts.backoff(attempt) : 0

    if (opts?.onAttempt) {
      opts.onAttempt({
        attempt,
        error: execution.error!,
        maxRetries: retries,
        finalAttempt: attempt === retries - 1,
        nextMs: delay,
      })
    }

    // hang until next timeout ms is reached
    if (delay > 0) {
      await new Promise((r) => setTimeout(r, delay))
    }

    finalError = execution.error!

    attempt++
  }

  return {error: finalError, data: null}
}
