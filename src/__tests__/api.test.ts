import * as lib from '../index.js'

test('core exports in index.js', () => {
  expect(lib.retry).toBeInstanceOf(Function)
  expect(lib.execute).toBeInstanceOf(Function)
  expect(lib.runWithConcurrency).toBeInstanceOf(Function)
  expect(lib.timeout).toBeInstanceOf(Function)
  expect(lib.exponentialBackoff).toBeInstanceOf(Function)
  expect(lib.linearBackoff).toBeInstanceOf(Function)
  expect(lib.manualBackoff).toBeInstanceOf(Function)
  expect(lib.squaringBackoff).toBeInstanceOf(Function)
})

test('execute exports in index.js', () => {
  expect(lib.runBlock).toBeInstanceOf(Function)
})
