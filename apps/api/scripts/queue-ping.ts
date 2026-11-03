// DOCU E1 — BullMQ smoke on bun: enqueues 1 'ping' job,
// a worker processes it and the script exits with the result.
// Separate connections: Queue, Worker and QueueEvents (the worker blocks its own).
import { Queue, QueueEvents, Worker } from 'bullmq'
import { Redis } from 'ioredis'

async function main(): Promise<void> {
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379'
  const mk = () => new Redis(url, { maxRetriesPerRequest: null })

  const queue = new Queue('e1-ping', { connection: mk() })
  const worker = new Worker(
    'e1-ping',
    async (job) => ({ pong: job.data.ping }),
    {
      connection: mk(),
    },
  )
  const events = new QueueEvents('e1-ping', { connection: mk() })
  await worker.waitUntilReady()
  await events.waitUntilReady()

  const job = await queue.add('ping', { ping: 'hola-cola' })
  const finished = await Promise.race([
    job.waitUntilFinished(events),
    new Promise((_, rej) =>
      setTimeout(() => rej(new Error('timeout 20s')), 20000),
    ),
  ])
  console.log('queue-ping OK:', JSON.stringify(finished))
  await events.close()
  await worker.close()
  await queue.close()
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
