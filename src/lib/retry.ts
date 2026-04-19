import {DEFAULT_BACKOFF_STRATEGY, getBackoffStrategy} from './backoff.js'
import {execute} from './execute.js'
import {RetryAttempt} from './types/attempt.js'
import {RunFn} from './types/run.js'
import {WrappedError} from './types/wrapped-error.js'

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

    const backoff = retries > 1 && !opts?.backoff ? DEFAULT_BACKOFF_STRATEGY : opts?.backoff
    const delay = backoff ? backoff(attempt) : 0

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
