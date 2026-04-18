import {Block, Context, Attempt} from '../types'

export {PluginManager} from './manager'
export {PluginRegistry} from './registry'

export type PluginInput = Hooks | PluginFactory | (new (ctx: Context) => Hooks)
export type PluginFactory = (ctx: Context) => Hooks

export interface Hooks {
  projectStart?(ctx: Context): Promise<void>
  projectEnd?(ctx: Context): Promise<void>

  blockStart?(ctx: Context, block: Block): Promise<void>
  blockEnd?(ctx: Context, block: Block): Promise<void>
  blockWait?(ctx: Context, block: Block): Promise<void>
  blockSkip?(ctx: Context, block: Block): Promise<void>
  blockRetry?(ctx: Context, block: Block, attempt: Attempt): Promise<void>
}
