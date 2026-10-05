// DOCU E1 — seed mínimo: catálogos, 3 usuarios demo, familias y reglas del caso.
// Passwords demo 'docu123' (bcrypt). M1 implementa auth real sobre esto.
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const empresa = await prisma.empresa.upsert({
    where: { id: '00000000-0000-4000-8000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-4000-8000-000000000001',
      nombre: 'Baja SterilPack (demo)',
    },
  })
  for (const nombre of ['Planeación', 'Calidad', 'Almacén']) {
    await prisma.departamento.upsert({
      where: { empresaId_nombre: { empresaId: empresa.id, nombre } },
      update: {},
      create: { empresaId: empresa.id, nombre },
    })
  }
  const roles = [
    ['admin', 'Administrador'],
    ['planeacion', 'Planeación'],
    ['calidad', 'Calidad'],
    ['almacen', 'Almacén'],
  ] as const
  for (const [codigo, nombre] of roles) {
    await prisma.rol.upsert({
      where: { codigo },
      update: {},
      create: { codigo, nombre },
    })
  }
  const hash = await bcrypt.hash('docu123', 10)
  const demos = [
    [
      'mariana.planeacion@docu.local',
      'Mariana Torres (planeación)',
      'planeacion',
    ],
    ['qa.calidad@docu.local', 'QA Calidad', 'calidad'],
    ['admin@docu.local', 'Admin DOCU', 'admin'],
  ] as const
  for (const [email, nombre, rolCodigo] of demos) {
    const u = await prisma.usuario.upsert({
      where: { email },
      update: {},
      create: { email, nombre, passwordHash: hash, empresaId: empresa.id },
    })
    const rol = await prisma.rol.findUniqueOrThrow({
      where: { codigo: rolCodigo },
    })
    await prisma.usuarioRol.upsert({
      where: { usuarioId_rolId: { usuarioId: u.id, rolId: rol.id } },
      update: {},
      create: { usuarioId: u.id, rolId: rol.id },
    })
  }
  const familias = [
    ['programa_planeacion', 'Programa semanal de planeación'],
    ['recepcion_rollo', 'Recepción de rollo con certificado'],
    ['inventario', 'Inventario de almacén'],
    ['excel_turno', 'Excel diario por máquina y turno'],
    ['correo_hermana', 'Correo de planta hermana'],
    ['escaneado', 'Hoja escaneada (verificación/certificado)'],
  ] as const
  for (const [codigo, nombre] of familias) {
    await prisma.configFamilia.upsert({
      where: { codigo },
      update: {},
      create: {
        codigo,
        nombre,
        esquema: { columnas: [], nota: 'C1 define el esquema' },
      },
    })
  }
  const reglas: Array<[string, string, string]> = [
    ['R-P1', 'Material sin certificado no se programa', 'BLOQUEO'],
    ['R-P2', 'Medida distinta a la pedida no se programa', 'BLOQUEO'],
    ['R-P3', 'Material ausente en almacén bloquea la fecha', 'BLOQUEO'],
    ['R-P4', 'Cambio de planta hermana dispara replan', 'AVISO'],
    ['R-Q1', 'Solo calidad libera; producción no se auto-libera', 'BLOQUEO'],
    ['R-A1', 'Paro mayor a 30 min exige motivo', 'BLOQUEO'],
    ['R-T1', 'Stock mínimo bloquea la orden', 'BLOQUEO'],
  ]
  for (const [codigo, descripcion, severidad] of reglas) {
    await prisma.reglaValidacion.upsert({
      where: { codigo },
      update: {},
      create: { codigo, descripcion, severidad, expresion: {} },
    })
  }
  for (let i = 1; i <= 5; i++) {
    await prisma.maquina.upsert({
      where: { codigo: `M${i}` },
      update: {},
      create: { codigo: `M${i}`, nombre: `Línea M${i}` },
    })
  }
  console.log(
    'seed OK: empresa, 3 deptos, 4 roles, 3 usuarios, 6 familias, 7 reglas, 5 máquinas',
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
