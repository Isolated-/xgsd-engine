import {Hooks, PluginFactory, PluginInput} from '.'
import {buildFactories, resolveFactory} from '../setup'
import {Registry} from '../generics/registry'
import {Block, Context, Project} from '../types'
import {Attempt} from '../types/attempt'

/**
 *  Lightweight plugin registry
 *  for internal and user plugin registration
 */
export class PluginRegistry implements Registry<PluginFactory, Context, Hooks[]> {
  private factories: ((ctx: Context) => Hooks)[] = []

  use(input: PluginInput) {
    this.factories.push(resolveFactory(input))
  }

  build(ctx: Context): Hooks[] {
    return buildFactories(this.factories, ctx)
  }
}
