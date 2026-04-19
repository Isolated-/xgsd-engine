import {DefaultExecutor} from '../../engine/executors/default'
import {createRuntime, resolveExecutor, SetupContainer} from '../../setup'
import {Executor} from '../../generics/executor'
import {Hooks, PluginManager} from '../../plugins'
import {Block, Context, createContext} from '../../types'

class CorePlugin implements Hooks {}

test('createRuntime()', async () => {
  const use = jest.fn()
  const build = jest.fn().mockReturnValue({
    pluginManager: {},
    loggerManager: {},
    executor: {},
  })

  const userCodeFn = jest.fn()
  const ctx = createContext({})

  const {pluginManager, loggerManager, executor} = await createRuntime({
    context: ctx,
    plugins: [CorePlugin],
    setupContainer: {
      use,
      build,
    } as any,
    userSetupFn: userCodeFn,
  })

  expect(use).toHaveBeenCalledTimes(1)
  expect(use).toHaveBeenCalledWith(CorePlugin)

  expect(build).toHaveBeenCalledTimes(1)
  expect(build).toHaveBeenCalledWith(ctx)

  expect(userCodeFn).toHaveBeenCalledTimes(1)

  expect(pluginManager).toEqual({})
  expect(loggerManager).toEqual({})
  expect(executor).toEqual({})
})

test('resolveExecutor()', () => {
  class MyExecutor implements Executor {
    run(block: Block<unknown>, context: Context<unknown>): Promise<Block<unknown>> {
      throw new Error('Method not implemented.')
    }
  }

  const ctx = createContext({})

  let result = resolveExecutor(MyExecutor)
  expect(result).toEqual(expect.any(Function))

  result = resolveExecutor(new MyExecutor())
  expect(result).toEqual(expect.any(Function))

  result = resolveExecutor((_) => new MyExecutor())
  expect(result).toEqual(expect.any(Function))

  expect(result(ctx)).toBeInstanceOf(MyExecutor)
})

describe('SetupContainer', () => {
  test('should return { pluginManager, executor } (default)', () => {
    class A implements Hooks {}
    const setup = new SetupContainer()

    setup.use(A)

    const ctx = createContext({})
    const result = setup.build(ctx)

    expect(result.pluginManager).toBeInstanceOf(PluginManager)
    expect(result.executor).toBeInstanceOf(DefaultExecutor)
  })

  test('should accept custom executor', () => {
    class CustomExecutor implements Executor {
      async run(block: Block<unknown>, context: Context<unknown>): Promise<Block<unknown>> {
        return block
      }
    }

    const setup = new SetupContainer()
    setup.executor(CustomExecutor)

    const ctx = createContext({})
    const result = setup.build(ctx)
    expect(result.executor).toBeInstanceOf(CustomExecutor)
  })
})
