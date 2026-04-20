import {SourceData} from './data.js'

/**
 * RunFn is the core execution signature used by the engine.
 *
 * It represents a single "runnable unit" (Block) that takes input data
 * and returns a result asynchronously.
 *
 * This is the primary function shape expected by engine utilities such as:
 * - execute()
 * - retry()
 * - timeout()
 *
 * User-defined blocks should conform to this signature:
 *
 *   export const myBlock: RunFn<Input, Output> = async (data) => {
 *     ...
 *   }
 *
 * @template T input data type
 * @template R return data type
 */
export type RunFn<T extends SourceData> = (data: T) => Promise<T>
