import {Executor} from '../generics/executor'
import {PluginRegistry, PluginInput, PluginManager} from '../plugins'
import {Context} from '../types'
import {Factory, FactoryInput} from '../types/core/factory'
import {DefaultExecutor} from './executors/default'

export const loadUserSetup = async (context: Context, setup: SetupContainer) => {
  const userModule = await import(context.package!)

  if (typeof userModule.setup === 'function') {
    await userModule.setup(setup)
  }
}

export const createRuntime = async (
  ctx: Context,
  plugins: PluginInput[] = [],
  setupContainer: SetupContainer = new SetupContainer(),
  userSetupFn: (ctx: Context, setup: SetupContainer) => Promise<void> = loadUserSetup,
) => {
  // pre-loaded/internal plugins are registered first:
  plugins.forEach((plugin) => setupContainer.use(plugin))

  // call setup() in user code:
  await userSetupFn(ctx, setupContainer)

  const {pluginManager, executor} = setupContainer.build(ctx)
  return {pluginManager, executor}
}

export const resolveExecutor = (input: ExecutorInput) => {
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

export type ExecutorFactory = Factory<Executor>
export type ExecutorInput = FactoryInput<Executor>

export class SetupContainer {
  private registry!: PluginRegistry
  private executorFactory?: ExecutorFactory

  constructor(registry?: PluginRegistry) {
    this.registry = registry || new PluginRegistry()
  }

  use(plugin: PluginInput) {
    this.registry.use(plugin)
  }

  executor(input: ExecutorInput) {
    this.executorFactory = resolveExecutor(input)
  }

  build(context: Context): {pluginManager: PluginManager; executor: Executor} {
    const executor = this.executorFactory ? this.executorFactory(context) : new DefaultExecutor()

    return {
      pluginManager: new PluginManager(this.registry.build(context)),
      executor,
    }
  }
}
