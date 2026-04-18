import {EventEmitter2} from 'eventemitter2'
import {createContext, RunState} from '../../types'

test('createContext() should return defaults', () => {
  const ctx = createContext({
    project: {},
  })

  expect(ctx.package).toEqual('')
  expect(ctx.project).toEqual({})
  expect(ctx.stream).toBeInstanceOf(EventEmitter2)
  expect(ctx.state).toBe(RunState.Starting)
})
