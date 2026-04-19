import {EventEmitter2} from 'eventemitter2'
import {Context, createContext, Project, SourceData} from './types'
import {createRuntime} from './setup'
import {Orchestrator} from './engine/orchestrator'
import {attachPluginEventListeners} from './plugins/manager'
import {Executor} from './generics/executor'

export const runProject = async <T = SourceData>(data: T, project: Project, event?: EventEmitter2) => {
  const ctx = createContext({
    project,
    stream: event,
  }) as Context<T>

  const {pluginManager, loggerManager, executor} = await createRuntime({
    context: ctx,
    plugins: [],
  })

  attachPluginEventListeners(loggerManager, ctx)
  attachPluginEventListeners(pluginManager, ctx)

  const orchestrator = new Orchestrator<T>(ctx, executor as Executor<T>)

  await orchestrator.orchestrate(data)
}
