import {Block, Context} from '../types'
import {Attempt} from '../types/attempt'
import {Hooks} from './registry'

export class PluginManager {
  constructor(private readonly _hooks: Hooks[]) {}

  async emit(event: any, ...args: any[]): Promise<void> {
    return invoke(this._hooks, event, args[0], args[1], args[2])
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
