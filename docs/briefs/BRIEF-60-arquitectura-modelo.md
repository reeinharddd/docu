# BRIEF #60 — Arquitectura y API de C1

## 0. Encabezado

- Issue: #60
- Dueño: Erik.
- Fechas: 2026-11-02 → 2026-11-12 · Sprint 3 · hito `C1 modelo y BD` (12-nov).
- Prioridad / Tipo / Épica: alta / tarea / Infraestructura.
- Requisitos: RF-08.
- Bloqueado por: #58 (modelo ya decidido) · Bloquea a: #12, #85

## 1. Contexto

La arquitectura no espera al v1: decisiones, capas, despliegue local/offline y responsabilidades ya están en los ADR. Este brief las deja escritas en `ARQUITECTURA.md` para que el esqueleto del backend (20-oct) no adivine.

## 2. Por qué importa tu parte

Sin arquitectura cerrada el 12-nov, #12 interpreta por su lado. Si sale bien, el backend y la IA se construyen sobre decisiones, no sobre supuestos.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| `ARQUITECTURA.md` cerrada | Decisiones por escrito + diagrama de despliegue local (PCs en red, sin nube) |
| Versiones = `package.json` reales | `verify` verde |

## 4. Actividades específicas

1. Cerrar `ARQUITECTURA.md` contra ADR-0009/0010/0011 + despliegue local/offline. Terminado: un tercero monta el sistema solo con ese doc.
2. Fijar versiones reales (`bun.lock` manda). Terminado: `verify` verde.

## 5. Entradas y salidas

- Recibe: ADRs, `STACK.md`, `BOOTSTRAP.md`.
- Entrega: al equipo por PR; alimenta #12. El modelo va en #62.

## 6. Referencias

- `decisiones/` (todas), `ingenieria/STACK.md`.

## 7. Cómo trabajar

- `/tarea 60`. Español, sin emojis. Cada afirmación con fuente.

## 8. Criterios de aceptación

- [ ] Decisiones escritas; despliegue local reproducible; `verify` verde.

### 8.1 Contrato, pruebas y criterio de listo

**Contrato.** El documento de arquitectura describe el sistema de C1: módulos,
procesos (API y worker), contratos de la API con sus reglas de error, y los
motores de IA como **configuración**, no como código.

**Criterios (Given/When/Then).**

1. **Given** un motor de IA distinto (otro OCR o otro modelo), **when** se
   cambia la configuración, **then** el sistema corre con el otro sin tocar
   código.
2. **Given** un error de la API, **when** el cliente lo recibe, **then** el
   error trae un código y un mensaje accionable, según la tabla del documento.
3. **Given** el modelo de datos (#58), **when** alguien lee la arquitectura,
   **then** los endpoints y las tablas se corresponden sin contradicciones.

**Plan de pruebas.** Revisión cruzada con `docs/ingenieria/MODELO-DATOS.md` y
con el ER de #58, más la comprobación de que cada motor configurable aparece en
la configuración y no en el código.

**Evidencia.** El documento de arquitectura, el diagrama de módulos y la tabla
de endpoints con sus errores, en el PR con `Closes #60`.

**Listo cuando.** La arquitectura está escrita, es coherente con el ER y
cualquiera puede implementar un endpoint sin preguntar.

## 9. Riesgos nombrados

Ninguno crítico: es compilar decisiones tomadas.

## 10. Revisión

Jueves 12-nov en el sync. Después: #62 modelo y #12 esqueleto.

## Versión corta


> [60] Arquitectura y API — reeinharddd, 2→12-nov. Arquitectura del sistema y contratos de la API de C1, ya decididos el modelo y el alcance. Entradas recibidas de docs/gestion/REPLAN-2026-10-30.md §4 y del ER aprobado (#58). Entregable: documento de arquitectura con los endpoints de C1 y sus reglas de error. Revisión el 12-nov. Detalle: `docs/briefs/BRIEF-60-arquitectura-modelo.md`.

