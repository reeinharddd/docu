# BRIEF #29 y #9 — Matriz de roles y dataset sintético

## 0. Encabezado

- Issues: #29 Matriz roles, permisos · #9 Dataset sintético (Configuración 1 y 2)
- Dueño: Carlos
- Fechas: #29 **ya vencida** (2026-09-30) → cerrar antes de 2026-10-09 · #9 2026-10-05 → 2026-10-16
- Prioridad / Tipo / Épica: alta / tarea / Autenticación (#29), QA/Documentación (#9)
- Requisitos: RF-06 (#29) · RNF-02, RNF-07 (#9)
- Bloquea a: #5 RBAC, #23 contrato de datos (#29) · #32 OCR, #3 pipeline, #6 pruebas (#9)

## 1. Contexto

DOCU decide en servidor quién ve y confirma qué: empresa → departamento → rol →
persona (RF-06, ADR-0006). Y todo se prueba con datos sintéticos de la planta
Baja SterilPack, porque no hay datos reales (`proyecto/CASO.md`).

## 2. Por qué importa tu parte

La matriz es insumo directo del modelo de datos: sin ella no se congela el
contrato del 23 de octubre (ADR-0012). El dataset alimenta la evaluación de OCR
de Emmanuel (#32), el pipeline (#3) y todas las pruebas de cierre (#6). Sin
dataset, ningún requisito se puede demostrar.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Matriz de roles y permisos | `docs/proyecto/ROLES.md`: tabla rol × acción (ver, subir, confirmar, configurar) × alcance (propio, departamento, empresa) |
| Usuarios demo | 3 usuarios de roles distintos descritos en `ROLES.md` |
| Primer lote de escaneados para #32 | 10 escaneados + CSV de *ground truth*, entregados a Emmanuel antes del 2026-10-09 |
| Dataset Configuración 1 | ~200 archivos (5 familias × 40: 100 válidos, 60 con error, 40 escaneados) generados por script con semilla en `dataset/` |
| Plan y casos de prueba base | `docs/ingenieria/PRUEBAS.md`: caso por RF con su evidencia esperada |

## 4. Actividades específicas

1. Partir de los cuatro roles del esquema (`admin`, `planeacion`, `calidad`,
   `almacen`, `ingenieria/MODELO-DATOS.md`) y de las reglas R-Q1 (solo calidad
   libera) y R-P1..P4. Escribir la matriz. Terminado: cada regla del caso
   tiene un rol responsable.
2. Revisar la matriz con Kira (qué ve cada rol en pantalla) y Emmanuel (#5).
3. Escribir el generador del dataset con semilla fija: mismo comando, mismos
   archivos. Los originales generados no se commitean (`.gitignore`), el script sí.
4. Generar y escanear (o simular a 150/300 dpi) el primer lote para #32.
5. Escribir el plan de pruebas a partir de "Pruebas que exige cada requisito"
   en `REQUISITOS.md`.

## 5. Entradas y salidas

- Recibe: caso y reglas (`CASO.md`, `CONTEXTO.md`), familias (`MODELO-DATOS.md`).
- Entrega: matriz a Emmanuel y Kira; escaneados a Emmanuel; dataset y plan a
  todo el equipo, por PR.

## 6. Referencias y caja de herramientas

- `docs/proyecto/CASO.md`, `REQUISITOS.md`, `CONTEXTO.md`.
- ADR-0006 (permisos en servidor) y ADR-0009 (reglas como datos).
- Automatizable: el dataset se genera con un script en TypeScript/Bun con
  semilla; nunca archivos a mano.

## 7. Cómo trabajar

- `/tarea 29`, luego `/tarea 9`; `/cerrar` en cada una. Un issue en progreso a la vez.
- Todo lo generado lleva semilla o versión.

## 8. Criterios de aceptación

- [ ] `ROLES.md` cubre los 4 roles, las 4 acciones y las 7 reglas del caso.
- [ ] Emmanuel confirma en #32 que recibió los escaneados con *ground truth*.
- [ ] `bun dataset/...` (comando documentado) regenera el dataset idéntico.
- [ ] `PRUEBAS.md` tiene un caso por RF.
- [ ] `bun run verify` en verde en cada PR.

## 9. Riesgos nombrados

#29 ya está vencida y bloquea el contrato de datos. Mitigación: entregar la
matriz primero (antes del 2026-10-09) y el dataset después.

## 10. Revisión

Viernes 2026-10-09 (matriz y escaneados) y viernes 2026-10-16 (dataset y plan),
con Erik.
