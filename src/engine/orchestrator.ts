import {Executor} from '../generics/executor'
import {BlockEvent, ProjectEvent} from '../plugins/manager'
import {Block, Context, SourceData} from '../types'

export class Orchestrator<T = SourceData> {
  constructor(
    private context: Context<T>,
    private executor: Executor<T>,
  ) {}

  event(name: ProjectEvent | BlockEvent, payload: any): void {
    this.context.stream?.emit(name, {event: name, payload})
  }

  before() {
    this.event(ProjectEvent.Started, {context: this.context})
  }

  after() {
    this.event(ProjectEvent.Ended, {context: this.context})
  }

  async orchestrate(input: T): Promise<void> {
    // before hook
    this.before()

    const ctx = this.context
    const userModule = await import(this.context.package!)

    // concurrency

    // input handling

    // call executeSteps()

    // after hook
    this.after()
  }

  async run(block: Block<T>): Promise<Block<T>> {
    return this.executor.run(block, this.context)
  }
}
