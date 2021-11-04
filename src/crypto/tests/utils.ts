const { performance } = require('perf_hooks')

// measure how long a call takes to complete
export const timed =
  (f: (...args: any[]) => any) =>
  async (...args: any) => {
    const start = performance.now()
    const result = await f(...args)
    const end = performance.now()

    const timeElapsed = `${(end - start).toFixed(4)}`
    return { ...result, timeElapsed }
  }
