import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = Number(process.env.PORT_API ?? 3000)
  await app.listen(port)
  console.log(`api escuchando en ${port}`)
}
bootstrap()
