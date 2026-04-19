import {buildFactories, LoggerInput, resolveFactory} from '../setup'
import {Logger} from '../generics/logger'
import {Registry} from '../generics/registry'
import {Context} from '../types'

export class LoggerRegistry implements Registry<LoggerInput, Context, Logger[]> {
  private factories: ((ctx: Context) => Logger)[] = []

  use(input: LoggerInput): void {
    this.factories.push(resolveFactory(input))
  }

  build(ctx: Context): Logger<unknown>[] {
    return buildFactories(this.factories, ctx)
  }
}
