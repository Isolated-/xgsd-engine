export type AsyncWorker<T = unknown, R = unknown> = (current: T, next: T, index: number) => Promise<R>
