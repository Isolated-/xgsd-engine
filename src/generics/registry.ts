export interface Registry<I = unknown, C = unknown, R = unknown> {
  use(input: I): void
  build(ctx: C): R
}
