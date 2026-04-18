import {Context, Project} from '../types'

export interface Registry<I = unknown, C = unknown, R = unknown> {
  use(input: I): void
  build(ctx: C): R
}

export interface Hooks {}

export type PluginInput = Hooks | PluginFactory | (new (ctx: Context) => Hooks)
export type PluginFactory = (ctx: Context) => Hooks

export class PluginRegistry implements Registry<PluginFactory, Context, Hooks[]> {
  private factories: ((ctx: Context) => Hooks)[] = []

  use(input: PluginInput) {
    if (typeof input === 'function') {
      this.factories.push((ctx) => {
        try {
          return new (input as any)(ctx)
        } catch {
          return (input as PluginFactory)(ctx)
        }
      })
      return
    }

    this.factories.push(() => input)
  }

  build(ctx: Context): Hooks[] {
    // this fixes user errors like:
    // xgsd.use((ctx) => {}) (no returns)
    // by dropping the plugin before its registered
    return this.factories
      .map((f) => {
        try {
          return f(ctx)
        } catch {
          return undefined
        }
      })
      .filter((hook): hook is Hooks => !!hook)
  }
}
