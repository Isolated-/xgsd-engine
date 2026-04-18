import {RunFn} from './core/run'
import {SourceData} from './core/source-data'

export type Block<T = SourceData> = {
  fn: RunFn<T, T>
}
