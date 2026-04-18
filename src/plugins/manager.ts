import {Block, Context} from '../types'
import {Attempt} from '../types/attempt'
import {Hooks} from '.'

export class PluginManager {
  constructor(private readonly _hooks: Hooks[]) {}

  async emit(event: any, ...args: any[]): Promise<void> {
    return invoke(this._hooks, event, args[0], args[1], args[2])
  }
}

export enum ProjectEvent {
  Started = 'project.started',
  Ended = 'project.ended',
}

export enum BlockEvent {
  Started = 'block.started',
  Ended = 'block.ended',
  Failed = 'block.failed',
  Retrying = 'block.retrying',
  Skipped = 'block.skipped',
  Waiting = 'block.waiting',
  Error = 'block.error',
}

const EVENT_MAP = {
  [ProjectEvent.Started]: 'projectStart',
  [ProjectEvent.Ended]: 'projectEnd',
  [BlockEvent.Started]: 'blockStart',
  [BlockEvent.Ended]: 'blockEnd',
  [BlockEvent.Retrying]: 'blockRetry',
  [BlockEvent.Skipped]: 'blockSkip',
  [BlockEvent.Waiting]: 'blockWait',
} as const

/**
 *  Attaches listeners for incoming events used by Plugins
 *
 *  @param {PluginManager} manager
 *  @param {ProjectContext} context
 */
export const attachPluginEventListeners = (manager: PluginManager, context: Context) => {
  const formattedContext = context

  for (const [event, handler] of Object.entries(EVENT_MAP)) {
    context.stream!.on(event, async (e: any) => {
      const payload = e.payload || {}

      await manager.emit(handler as InvokeFn, formattedContext, payload.step, payload.attempt)
    })
  }
}

const ctxOnly = (ctx: Context) => [ctx]
const ctxBlock = (ctx: Context, block?: Block) => [ctx, block]

const INVOKE_ARGS = {
  projectStart: ctxOnly,
  projectEnd: ctxOnly,

  blockStart: ctxBlock,
  blockEnd: ctxBlock,
  blockWait: ctxBlock,
  blockSkip: ctxBlock,

  blockRetry: (ctx: Context, block?: Block, attempt?: Attempt) => [ctx, block, attempt],
} as const

export type InvokeFn = keyof typeof INVOKE_ARGS

export const invoke = async (
  hooks: Hooks[],
  fn: InvokeFn,
  context: Context,
  block?: Block,
  attempt?: Attempt,
): Promise<void> => {
  for (const hook of hooks) {
    const method = hook[fn]

    if (typeof method !== 'function') continue

    try {
      const args = INVOKE_ARGS[fn](context, block, attempt!)
      await (method as any).call(hook, ...args)
    } catch (error) {}
  }
}
