import {retry} from '../core/retry.js'
import {RetryAttempt} from '../core/types/attempt.js'
import {BlockEvent} from './types/events.js'
import {Block, Context, RunState} from './types/executor.js'

export const runBlock = async <B extends Block, C extends Context>(
  block: B,
  context: C,
  opts: {
    event?: (name: string, payload: any) => void
    attempt?: (attempt: RetryAttempt) => Promise<any>
    // use this until data functions are imported
    // allows function to be injected from cli
    prepareData: (block: B, ctx: C) => B
    finaliseData: (block: B, ctx: C) => B
  },
): Promise<B> => {
  // prepare block data
  const preparedData = opts.prepareData(block as B, context)
  preparedData.startedAt = new Date().toISOString()

  const {event, attempt} = opts
  if (!shouldRun(preparedData)) {
    preparedData.state = RunState.Skipped
    event?.(BlockEvent.Skipped, {block: preparedData})
    event?.(BlockEvent.Ended, {block: preparedData})
    return preparedData
  }

  event?.(BlockEvent.Started, {block: preparedData})
  const options = {
    timeout: 1000,
    retries: 3,
  }

  const {timeout, retries} = options

  preparedData.errors = []
  const result = await retry(preparedData.data, preparedData.fn, retries, {
    timeout,
    onAttempt: async (a) => {
      attempt?.(a)
      preparedData.state = RunState.Retrying
      preparedData.attempt = a.attempt + 1
      preparedData.errors.push(a.error)
      event?.(BlockEvent.Retrying, {
        block: preparedData,
        attempt: a,
      })
    },
  })

  preparedData.endedAt = new Date().toISOString()

  let output = result.data
  if (
    typeof output === 'number' ||
    typeof output === 'string' ||
    typeof output === 'boolean' ||
    Array.isArray(output)
  ) {
    output = {data: output}
  }

  Object.assign(preparedData, {
    output,
    error: result.error,
    options: {retries, timeout},
    state: result.error ? RunState.Failed : RunState.Completed,
    duration: Date.parse(preparedData.endedAt) - Date.parse(preparedData.startedAt),
  })

  const finalisedData = opts.finaliseData(block as B, context)

  event?.(BlockEvent.Ended, {
    block: finalisedData,
  })

  return finalisedData
}

const shouldRun = <B extends Block>(block: B) => {
  if (block.if !== false || block.enabled !== false) {
    return true
  }

  return false
}
