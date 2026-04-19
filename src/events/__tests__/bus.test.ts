import {EventBus} from '../bus.js'

type TestEvents = {
  'test.event': {value: number}
  'other.event': {msg: string}
}

const createEmitter = () => {
  const handlers: Record<string, Function[]> = {}

  return {
    on: jest.fn((event: string, handler: Function) => {
      handlers[event] = handlers[event] || []
      handlers[event].push(handler)
    }),

    off: jest.fn((event: string, handler: Function) => {
      handlers[event] = (handlers[event] || []).filter((h) => h !== handler)
    }),

    emit: jest.fn(async (event: string, payload: any) => {
      const list = handlers[event] || []
      for (const handler of list) {
        await handler(payload)
      }
    }),

    // helper for assertions
    __handlers: handlers,
  }
}

test('on registers handler and emit triggers it with event envelope', async () => {
  const emitter = createEmitter()
  const bus = new EventBus<typeof emitter, TestEvents>(emitter)

  const handler = jest.fn()

  bus.on('test.event', handler)

  await bus.emit('test.event', {value: 42})

  expect(handler).toHaveBeenCalledWith({
    event: 'test.event',
    payload: {value: 42},
  })
})

test('off removes handler and prevents it from being called', async () => {
  const emitter = createEmitter()
  const bus = new EventBus<typeof emitter, TestEvents>(emitter)

  const handler = jest.fn()

  const unsubscribe = bus.on('test.event', handler)

  unsubscribe()

  await bus.emit('test.event', {value: 1})

  expect(handler).not.toHaveBeenCalled()
})

test('multiple handlers are all called', async () => {
  const emitter = createEmitter()
  const bus = new EventBus<typeof emitter, TestEvents>(emitter)

  const h1 = jest.fn()
  const h2 = jest.fn()

  bus.on('test.event', h1)
  bus.on('test.event', h2)

  await bus.emit('test.event', {value: 10})

  expect(h1).toHaveBeenCalledTimes(1)
  expect(h2).toHaveBeenCalledTimes(1)
})

test('handlers receive correct payload per event type', async () => {
  const emitter = createEmitter()
  const bus = new EventBus<typeof emitter, TestEvents>(emitter)

  const handler = jest.fn()

  bus.on('other.event', handler)

  await bus.emit('other.event', {msg: 'hello'})

  expect(handler).toHaveBeenCalledWith({
    event: 'other.event',
    payload: {msg: 'hello'},
  })
})

test('emit does nothing when no handlers are registered', async () => {
  const emitter = createEmitter()
  const bus = new EventBus<typeof emitter, TestEvents>(emitter)

  await expect(bus.emit('test.event', {value: 123})).resolves.toBeUndefined()
})

test('unsubscribe only removes specific handler', async () => {
  const emitter = createEmitter()
  const bus = new EventBus<typeof emitter, TestEvents>(emitter)

  const h1 = jest.fn()
  const h2 = jest.fn()

  const unsub1 = bus.on('test.event', h1)
  bus.on('test.event', h2)

  unsub1()

  await bus.emit('test.event', {value: 5})

  expect(h1).not.toHaveBeenCalled()
  expect(h2).toHaveBeenCalledTimes(1)
})

test('handlers can be async', async () => {
  const emitter = createEmitter()
  const bus = new EventBus<typeof emitter, TestEvents>(emitter)

  const handler = jest.fn(async () => {
    await new Promise((r) => setTimeout(r, 10))
  })

  bus.on('test.event', handler)

  await bus.emit('test.event', {value: 99})

  expect(handler).toHaveBeenCalledTimes(1)
})
