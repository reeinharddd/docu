// Prisma 7: la conexión vive aquí (ya no en el schema).
// Carga el .env de la raíz del monorepo para que `bun run` funcione
// desde cualquier carpeta sin exportar variables a mano.
import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

config({ path: '../../.env' })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
})
