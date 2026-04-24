import {execute} from './execute.js'
import {withTimeout} from './timeout.js'
import {RetryAttempt} from './types/attempt.js'
import {SourceData} from './types/data.js'
import {RunFn} from './types/run.js'
import {WrappedError} from './types/wrapped-error.js'

export type RetryOpts<T> = {
  timeoutWrapper?: (fn: () => Promise<T>) => Promise<T>
  backoff?: (attempt: number) => number
  onAttempt?: (attempt: RetryAttempt) => void
}

/**
 * Retry a function call with configurable backoff and optional timeout.
 *
 * This utility repeatedly executes a function until it succeeds or the
 * retry limit is reached. It uses the engine's `execute()` function
 * internally, meaning all errors are automatically normalised into
 * `WrappedError` format.
 *
 * @template T - Input data type (must extend SourceData)
 *
 * @param data - Input data passed to the function on each attempt
 * @param fn - Async function to execute
 * @param retries - Maximum number of attempts before giving up
 * @param opts - Optional retry configuration
 *
 * @returns A promise resolving to either:
 * - `{ data: result, error: null }` on success
 * - `{ data: null, error: WrappedError }` if all retries fail
 *
 * @example
 * ```ts
 * await retry(
 *   { value: 1 },
 *   async (data) => ({ value: data.value + 1 }),
 *   3,
 *   {
 *     backoff: exponentialBackoff,
 *     onAttempt: (a) => console.log(a.attempt),
 *   }
 * )
 * ```
 */
export async function retry<T extends SourceData>(data: T, fn: RunFn<T>, retries: number, opts?: RetryOpts<T>) {
  let attempt = 0
  let finalError: WrappedError | null = null

  const backoff = opts?.backoff

  while (attempt < retries) {
    const execution = await execute<T, WrappedError>(data, fn, opts?.timeoutWrapper)

    if (!execution.error) {
      return {data: execution.data, error: null}
    }

    const final = attempt === retries - 1
    const delay = retries > 1 ? backoff!(attempt) : 0

    if (opts?.onAttempt) {
      opts.onAttempt({
        attempt,
        error: execution.error!,
        maxRetries: retries,
        finalAttempt: final,
        nextMs: delay,
      })
    }

    // hang until next timeout ms is reached
    // checking for final prevents hanging
    // when there isn't another attempt coming
    if (delay > 0 && !final) {
      await new Promise((r) => setTimeout(r, delay))
    }

    finalError = execution.error!

    attempt++
  }

  return {error: finalError, data: null}
}
