import {Block, Context, Attempt} from '../types'
import {Factory, FactoryInput} from '../types/core/factory'

export {PluginManager} from './manager'
export {PluginRegistry} from './registry'

export type PluginFactory = Factory<Hooks>
export type PluginInput = FactoryInput<Hooks>

export interface Hooks {
  projectStart?(ctx: Context): Promise<void> | void
  projectEnd?(ctx: Context): Promise<void> | void

  blockStart?(ctx: Context, block: Block): Promise<void> | void
  blockEnd?(ctx: Context, block: Block): Promise<void> | void
  blockWait?(ctx: Context, block: Block): Promise<void> | void
  blockSkip?(ctx: Context, block: Block): Promise<void> | void
  blockRetry?(ctx: Context, block: Block, attempt: Attempt): Promise<void> | void
}
