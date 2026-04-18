import {Hooks} from '../plugins'

export interface Logger<T = unknown> extends Hooks {
  log(message: T): Promise<void> | void
}
