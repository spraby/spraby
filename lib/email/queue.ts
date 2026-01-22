const DEFAULT_SEND_INTERVAL_MS = 1000

let lastSentAt = 0
let sendQueue: Promise<void> = Promise.resolve()

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function enqueueEmailSend<T>(task: () => Promise<T>): Promise<T> {
  const run = async () => {
    const intervalMs = Number(process.env.EMAIL_SEND_INTERVAL_MS) || DEFAULT_SEND_INTERVAL_MS
    const now = Date.now()
    const waitMs = Math.max(0, lastSentAt + intervalMs - now)
    if (waitMs > 0) {
      await sleep(waitMs)
    }

    try {
      return await task()
    } finally {
      lastSentAt = Date.now()
    }
  }

  const result = sendQueue.then(run, run)
  sendQueue = result.then(() => undefined, () => undefined)
  return result
}
