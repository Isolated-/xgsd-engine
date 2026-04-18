import {Block} from '../types/block'
import {Context} from '../types/context'
import {SourceData} from '../types/core/source-data'

export interface Executor<T = SourceData> {
  run(block: Block<T>, context: Context<T>): Promise<Block<T>>
}
