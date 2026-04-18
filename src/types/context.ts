import {EventEmitter2} from 'eventemitter2'
import {SourceData} from './core/source-data'
import {Project} from './project'

export enum RunState {
  Starting = 'starting',
}

export type Context<T = SourceData> = {
  project: Project
  stream: EventEmitter2
  package: string
  state: RunState
  input: T | null
  output: T | null
}

export const createContext = <T = SourceData>(context: Partial<Context<T>>): Context<T> => {
  return Object.assign(
    {
      package: '',
      stream: new EventEmitter2(),
      state: RunState.Starting,
      input: null,
      output: null,
    },
    context,
  ) as Context<T>
}
