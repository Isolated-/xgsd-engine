import {Executor} from './generics/executor'
import {Logger} from './generics/logger'
import {LoggerManager} from './loggers/manager'
import {LoggerRegistry} from './loggers/registry'
import {PluginRegistry, PluginInput, PluginManager, Hooks} from './plugins'
import {Context} from './types'
import {Factory, FactoryInput} from './types/core/factory'
import {DefaultExecutor} from './engine/executors/default'

export const loadUserSetup = async (context: Context, setup: SetupContainer) => {
  const userModule = await import(context.package!)

  if (typeof userModule.setup === 'function') {
    await userModule.setup(setup)
  }
}

export const createRuntime = async (opts: {
  context: Context
  plugins?: PluginInput[]
  loggers?: LoggerInput[]
  setupContainer?: SetupContainer
  userSetupFn?: (ctx: Context, setup: SetupContainer) => Promise<void>
}) => {
  const {context, plugins} = opts

  const setupContainer = opts.setupContainer ?? new SetupContainer()
  const userSetupFn = opts.userSetupFn ?? loadUserSetup

  // pre-loaded/internal plugins are registered first:
  plugins?.forEach((plugin) => setupContainer.use(plugin))

  // call setup() in user code:
  await userSetupFn(context, setupContainer)

  const {pluginManager, loggerManager, executor} = setupContainer.build(context)
  return {pluginManager, loggerManager, executor}
}

export const resolveExecutor = (input: ExecutorInput) => {
  return resolveFactory(input)
}

export const resolveFactory = <T = unknown>(input: FactoryInput<T>) => {
  if (typeof input === 'function') {
    return (ctx: Context) => {
      try {
        return new (input as any)(ctx)
      } catch {
        return (input as any)(ctx)
      }
    }
  }

  return () => input
}

export const buildFactories = <T = unknown>(factories: Factory<T>[], ctx: Context) => {
  // this fixes user errors like:
  // xgsd.use((ctx) => {}) (no returns)
  // by dropping the plugin before its registered
  return factories
    .map((f) => {
      try {
        return f(ctx)
      } catch {
        return undefined
      }
    })
    .filter((factory): factory is T => !!factory)
}

export type ExecutorFactory = Factory<Executor>
export type ExecutorInput = FactoryInput<Executor>

export type LoggerFactory = Factory<Logger>
export type LoggerInput = FactoryInput<Logger>

export class SetupContainer {
  private plugins!: PluginRegistry
  private loggers!: LoggerRegistry

  private executorFactory?: ExecutorFactory
  constructor(plugins?: PluginRegistry, loggers?: LoggerRegistry) {
    this.plugins = plugins || new PluginRegistry()
    this.loggers = loggers || new LoggerRegistry()
  }

  use(plugin: PluginInput) {
    this.plugins.use(plugin)
  }

  executor(input: ExecutorInput) {
    this.executorFactory = resolveExecutor(input)
  }

  logger(logger: LoggerInput) {
    this.loggers.use(logger)
  }

  build(context: Context): {pluginManager: PluginManager; loggerManager: LoggerManager; executor: Executor} {
    const executor = this.executorFactory ? this.executorFactory(context) : new DefaultExecutor()

    const pluginManager = new PluginManager(this.plugins.build(context))
    const loggerManager = new LoggerManager(this.loggers.build(context))

    return {
      pluginManager,
      loggerManager,
      executor,
    }
  }
}
