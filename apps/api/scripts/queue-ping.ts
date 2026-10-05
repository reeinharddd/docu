// DOCU E1 — smoke de BullMQ sobre bun: encola 1 trabajo 'ping',
// un worker lo procesa y el script sale con el resultado.
// Conexiones separadas: Queue, Worker y QueueEvents (el worker bloquea la suya).
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
