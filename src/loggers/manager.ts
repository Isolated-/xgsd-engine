import {Logger} from '../generics/logger'
import {Manager} from '../generics/manager'
import {invoke} from '../plugins/manager'

export class LoggerManager implements Manager {
  constructor(private loggers: Logger[]) {}

  async emit(event: any, ...args: any[]): Promise<void> {
    return invoke(this.loggers, event, args[0], args[1], args[2])
  }
}
