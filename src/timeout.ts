export async function timeout<T>(ms: number, task: () => Promise<T>): Promise<T> {
  let timer: NodeJS.Timeout | undefined

  return Promise.race<T>([
    task(),
    new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Timeout')), ms)
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer)
  })
}

export function withTimeout<T>(ms: number) {
  return (fn: () => Promise<T>) => timeout(ms, fn)
}
