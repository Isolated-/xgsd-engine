import {Logger} from '../../generics/logger'
import {Context, Block, Attempt} from '../../types'

export type Log = {
  message: string
  level?: string
  context: Context
  block?: Block
  attempt?: Attempt
}

export class DebugLogger implements Logger<Log> {
  log(message: Log) {
    console.debug(message.message)
  }

  projectStart(context: Context) {
    this.log({
      context,
      message: `project has started`,
    })
  }
}
