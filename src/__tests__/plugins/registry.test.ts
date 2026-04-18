import {Hooks} from '../../plugins'
import {PluginRegistry} from '../../plugins/registry'
import {Context, createContext} from '../../types'

class A implements Hooks {}
class B implements Hooks {}
class C implements Hooks {}

test('.use() accepts factory-style creation', () => {
  const factory = (ctx: Context) => new A()
  const registry = new PluginRegistry()

  registry.use(factory)

  const ctx = createContext({})

  const hooks = registry.build(ctx)
  expect(hooks).toHaveLength(1)
})

test('.use() accepts class creation (uninitialised)', () => {
  const registry = new PluginRegistry()

  registry.use(A)

  const ctx = createContext({})
  const hooks = registry.build(ctx)
  expect(hooks).toHaveLength(1)
})

test('.use() accepts class creation (initialised)', () => {
  const registry = new PluginRegistry()

  registry.use(new A())

  const ctx = createContext({})
  const hooks = registry.build(ctx)
  expect(hooks).toHaveLength(1)

  expect(hooks).toEqual([expect.any(A)])
})

test('.use() preserves order', () => {
  const registry = new PluginRegistry()

  registry.use(new A())
  registry.use(new B())
  registry.use(new C())

  const ctx = createContext({})
  const hooks = registry.build(ctx)
  expect(hooks).toEqual([expect.any(A), expect.any(B), expect.any(C)])
})

test(".use() doesn't re-create instances", () => {
  const instance = new A()
  const registry = new PluginRegistry()

  registry.use(new A())
  registry.use(instance)
  registry.use(new B())

  const ctx = createContext({})
  const hooks = registry.build(ctx)
  expect(hooks).toEqual([expect.any(A), instance, expect.any(B)])
})

test('.use doesnt register undefined plugins when no return value is provided (factory style)', () => {
  const ctx = createContext({})
  const registry = new PluginRegistry() as any

  // when no return value is provided with factory style construction
  // the plugin would still be added to _hooks
  // this would result in "Cannot read properties of undefined (reading 'projectStart')"
  registry.use((ctx: any) => {})

  // expected behaviour is an empty array of hooks:
  const hooks = registry.build(ctx)
  expect(hooks).toHaveLength(0)
})
