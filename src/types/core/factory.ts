import {Context} from '../context'

export type Factory<T> = (ctx: Context) => T
export type FactoryInput<T> = T | Factory<T> | (new (ctx: Context) => Factory<T>)
