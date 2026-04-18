import {Executor} from '../../generics/executor'
import {Block, Context, SourceData} from '../../types'

export class DefaultExecutor<T = SourceData> implements Executor<T> {
  run(block: Block<T>, context: Context<T>): Promise<Block<T>> {
    throw new Error('Method not implemented.')
  }
}
