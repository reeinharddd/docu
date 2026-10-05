CREATE EXTENSION IF NOT EXISTS vector;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departamento" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "departamentoId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioRol" (
    "usuarioId" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,

    CONSTRAINT "UsuarioRol_pkey" PRIMARY KEY ("usuarioId","rolId")
);

-- CreateTable
CREATE TABLE "ArchivoOriginal" (
    "id" TEXT NOT NULL,
    "sha256" TEXT NOT NULL,
    "familia" TEXT NOT NULL,
    "nombreOriginal" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "bytes" BIGINT NOT NULL,
    "ruta" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'RECIBIDO',
    "metadatos" JSONB,
    "fechaIngesta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchivoOriginal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cuarentena" (
    "id" TEXT NOT NULL,
    "archivoId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "reglaCodigo" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'ABIERTA',
    "resueltoPorId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resueltoEn" TIMESTAMP(3),

    CONSTRAINT "Cuarentena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatoOficial" (
    "id" TEXT NOT NULL,
    "familia" TEXT NOT NULL,
    "claveNegocio" TEXT NOT NULL,
    "datos" JSONB NOT NULL,
    "embedding" vector(768),
    "archivoId" TEXT,
    "confirmadoPorId" TEXT,
    "fechaConfirmacion" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatoOficial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistorialOrigen" (
    "id" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "origenTipo" TEXT NOT NULL,
    "origenRef" TEXT NOT NULL,
    "reglaAplicada" TEXT,
    "confirmadoPorId" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HistorialOrigen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bitacora" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "detalle" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigFamilia" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "esquema" JSONB NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ConfigFamilia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReglaValidacion" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "expresion" JSONB NOT NULL,
    "severidad" TEXT NOT NULL DEFAULT 'BLOQUEO',
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ReglaValidacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maquina" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Maquina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orden" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "producto" TEXT NOT NULL,
    "medida" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'CREADA',

    CONSTRAINT "Orden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rollo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "material" TEXT NOT NULL,
    "medida" TEXT NOT NULL,
    "certificado" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'RECIBIDO',

    CONSTRAINT "Rollo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programa" (
    "id" TEXT NOT NULL,
    "ordenId" TEXT NOT NULL,
    "maquinaId" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PROGRAMADA',

    CONSTRAINT "Programa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prueba" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL,
    "queCubre" TEXT NOT NULL,
    "resultado" TEXT,

    CONSTRAINT "Prueba_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "destinatarios" JSONB NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'NUEVA',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Departamento_empresaId_nombre_key" ON "Departamento"("empresaId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_codigo_key" ON "Rol"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ArchivoOriginal_sha256_key" ON "ArchivoOriginal"("sha256");

-- CreateIndex
CREATE UNIQUE INDEX "DatoOficial_familia_claveNegocio_key" ON "DatoOficial"("familia", "claveNegocio");

-- CreateIndex
CREATE INDEX "HistorialOrigen_entidad_entidadId_idx" ON "HistorialOrigen"("entidad", "entidadId");

-- CreateIndex
CREATE INDEX "Bitacora_entidad_entidadId_idx" ON "Bitacora"("entidad", "entidadId");

-- CreateIndex
CREATE UNIQUE INDEX "ConfigFamilia_codigo_key" ON "ConfigFamilia"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "ReglaValidacion_codigo_key" ON "ReglaValidacion"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Maquina_codigo_key" ON "Maquina"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Orden_folio_key" ON "Orden"("folio");

-- CreateIndex
CREATE UNIQUE INDEX "Rollo_codigo_key" ON "Rollo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Programa_ordenId_maquinaId_fecha_key" ON "Programa"("ordenId", "maquinaId", "fecha");

-- AddForeignKey
ALTER TABLE "Departamento" ADD CONSTRAINT "Departamento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioRol" ADD CONSTRAINT "UsuarioRol_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cuarentena" ADD CONSTRAINT "Cuarentena_archivoId_fkey" FOREIGN KEY ("archivoId") REFERENCES "ArchivoOriginal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bitacora" ADD CONSTRAINT "Bitacora_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

