export const DEFAULT_ERROR_NAME: string = 'UnknownError'
export const DEFAULT_ERROR_MESSAGE: string = 'Unknown error'
export const DEFAULT_ERROR_STACK: string = 'unknown'

export type WrappedError<T = unknown> = {
  original: T
  name: string
  message: string
  stack?: string
}
