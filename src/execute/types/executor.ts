import {RunFn, SourceData, WrappedError} from '../../core/types/index.js'

export type Context = {
  stream: any
  package: string
}

export enum RunState {
  Skipped,
  Running,
  Waiting,
  Retrying,
  Failed,
  Completed,
}

export type Block<T extends SourceData = unknown> = {
  data?: T
  input: T | null
  output: T
  if: boolean
  enabled: boolean
  state: RunState
  options: {
    timeout: number
    retries: number
  }
  fn: RunFn<T, T>
  attempt: number
  errors: WrappedError[]
  // timestamps
  startedAt: string
  endedAt: string
}

export interface Executor<B extends Block, C extends Context> {
  run(block: B, ctx: C): Promise<B>
}
