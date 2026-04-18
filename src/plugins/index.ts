import {Block, Context, Attempt} from '../types'
import {Factory, FactoryInput} from '../types/core/factory'

export {PluginManager} from './manager'
export {PluginRegistry} from './registry'

export type PluginFactory = Factory<Hooks>
export type PluginInput = FactoryInput<Hooks>

export interface Hooks {
  projectStart?(ctx: Context): Promise<void>
  projectEnd?(ctx: Context): Promise<void>

  blockStart?(ctx: Context, block: Block): Promise<void>
  blockEnd?(ctx: Context, block: Block): Promise<void>
  blockWait?(ctx: Context, block: Block): Promise<void>
  blockSkip?(ctx: Context, block: Block): Promise<void>
  blockRetry?(ctx: Context, block: Block, attempt: Attempt): Promise<void>
}
