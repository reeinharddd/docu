// Proxy del dev server: la web llama a `/v1` (relativo) y el dev server lo
// reenvía a la API.
//
// Por qué un proxy y no una base absoluta en el código: la app no cambia con
// el entorno. En desarrollo el dev server hace de proxy; en producción lo
// hace el reverse proxy que termina TLS (la app sigue pidiendo `/v1`). Es el
// mismo camino en los dos casos, así que lo que se prueba en local es lo que
// se despliega.
//
// El destino sale del MISMO `.env` que usa la API (PORT_API), así que quien
// levanta la pila no tiene que configurar la web por separado. Para un
// destino puntual: API_PROXY_TARGET=http://localhost:3112 bun run start.
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '..', '..')

function apiPortFromEnvFile() {
  const envPath = join(repoRoot, '.env')
  if (!existsSync(envPath)) return '3000'
  const line = readFileSync(envPath, 'utf8')
    .split('\n')
    .find((candidate) => candidate.trim().startsWith('PORT_API='))
  const port = line?.split('=')[1]?.trim()
  return port !== undefined && /^\d+$/.test(port) ? port : '3000'
}

const target =
  process.env.API_PROXY_TARGET ?? `http://localhost:${apiPortFromEnvFile()}`

export default {
  '/v1': {
    target,
    secure: false,
    changeOrigin: true,
  },
}
