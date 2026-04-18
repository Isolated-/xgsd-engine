import {PluginRegistry} from '../../plugins/registry'
import {Context} from '../../types'

test('.use() accepts factory-style creation', () => {
  class A {}
  const factory = (ctx: Context) => new A()
  const registry = new PluginRegistry()

  registry.use(factory)

  const hooks = registry.build({})
  expect(hooks).toHaveLength(1)
})

test('.use() accepts class creation (uninitialised)', () => {
  class A {}
  const registry = new PluginRegistry()

  registry.use(A)

  const hooks = registry.build({})
  expect(hooks).toHaveLength(1)
})

test('.use() accepts class creation (initialised)', () => {
  class A {}
  const registry = new PluginRegistry()

  registry.use(new A())

  const hooks = registry.build({})
  expect(hooks).toHaveLength(1)
})

test('.use doesnt register undefined plugins when no return value is provided (factory style)', () => {
  const context = {} as any
  const registry = new PluginRegistry()

  // when no return value is provided with factory style construction
  // the plugin would still be added to _hooks
  // this would result in "Cannot read properties of undefined (reading 'projectStart')"
  registry.use((ctx: any) => {})

  // expected behaviour is an empty array of hooks:
  const hooks = registry.build(context)
  expect(hooks).toHaveLength(0)
})
