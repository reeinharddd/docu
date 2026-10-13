# BRIEF #60 — Arquitectura documentada

## 0. Encabezado

- Issue: #60
- Dueño: Erik.
- Fechas: 2026-10-13 → 2026-10-16 · Sprint 1.
- Prioridad / Tipo / Épica: alta / tarea / Infraestructura.
- Requisitos: RNF-05, RNF-06.
- Bloqueado por: ninguno (decisiones tomadas) · Bloquea a: #12

## 1. Contexto

La arquitectura no espera al v1: decisiones, capas, despliegue local/offline y responsabilidades ya están en los ADR. Este brief las deja escritas en `ARQUITECTURA.md` para que el esqueleto del backend (20-oct) no adivine.

## 2. Por qué importa tu parte

Sin arquitectura cerrada el 16-oct, #12 interpreta por su lado. Si sale bien, S2 construye sobre decisiones, no sobre supuestos.

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

## 9. Riesgos nombrados

Ninguno crítico: es compilar decisiones tomadas.

## 10. Revisión

Viernes 16-oct en el sync. Después: #62 modelo, #12 esqueleto.

## Versión corta

> [60] Arquitectura — Erik, 13→16-oct. ARQUITECTURA.md cerrada. Modelo en #62. Detalle: `docs/briefs/BRIEF-60-arquitectura-modelo.md`.
