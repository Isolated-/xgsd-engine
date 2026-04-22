import {AsyncWorker} from './types/worker'

/**
 *  Runs an AsyncWorker with concurrency
 *
 *  @param items
 *  @param limit
 *  @param worker
 */
export async function runWithConcurrency<T = unknown, R = unknown>(
  items: T[],
  limit: number,
  worker: AsyncWorker<T, R>,
): Promise<void> {
  const executing: Promise<any>[] = []

  for (let i = 0; i < items.length; i++) {
    // worker is now called with the next worker
    // to provide an easier way of accessing it
    const p = worker(items[i], items[i + 1], i)

    // When finished, remove from executing
    const e = p.then(() => {
      executing.splice(executing.indexOf(e), 1)
    })

    executing.push(e)

    if (executing.length >= limit) {
      await Promise.race(executing)
    }
  }

  await Promise.all(executing)
}
