import {WrappedError} from './wrapped-error'

export type RetryAttempt = {
  attempt: number
  maxRetries: number
  error: WrappedError
  nextMs: number
  finalAttempt: boolean
}
