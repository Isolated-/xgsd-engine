import {DefaultExecutor} from '../../engine/executors/default'
import {createRuntime, resolveExecutor, SetupContainer} from '../../engine/setup'
import {Executor} from '../../generics/executor'
import {Hooks, PluginManager} from '../../plugins'
import {Block, Context} from '../../types'

class CorePlugin implements Hooks {}

test('createRuntime()', async () => {
  const use = jest.fn()
  const build = jest.fn().mockReturnValue({
    pluginManager: {},
    executor: {},
  })

  const userCodeFn = jest.fn()

  const {pluginManager, executor} = await createRuntime(
    {},
    [CorePlugin],
    {
      use,
      build,
    } as any,
    userCodeFn,
  )

  expect(use).toHaveBeenCalledTimes(1)
  expect(use).toHaveBeenCalledWith(CorePlugin)

  expect(build).toHaveBeenCalledTimes(1)
  expect(build).toHaveBeenCalledWith({})

  expect(userCodeFn).toHaveBeenCalledTimes(1)

  expect(pluginManager).toEqual({})
  expect(executor).toEqual({})
})

test('resolveExecutor()', () => {
  class MyExecutor implements Executor {
    run(block: Block<unknown>, context: Context<unknown>): Promise<Block<unknown>> {
      throw new Error('Method not implemented.')
    }
  }

  let result = resolveExecutor(MyExecutor)
  expect(result).toEqual(expect.any(Function))

  result = resolveExecutor(new MyExecutor())
  expect(result).toEqual(expect.any(Function))

  result = resolveExecutor((_) => new MyExecutor())
  expect(result).toEqual(expect.any(Function))

  expect(result({})).toBeInstanceOf(MyExecutor)
})

describe('SetupContainer', () => {
  test('should return { pluginManager, executor } (default)', () => {
    class A implements Hooks {}
    const setup = new SetupContainer()

    setup.use(A)

    const result = setup.build({})

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

    const result = setup.build({})
    expect(result.executor).toBeInstanceOf(CustomExecutor)
  })
})
