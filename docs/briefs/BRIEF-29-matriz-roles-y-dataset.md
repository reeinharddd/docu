# BRIEF #29 y #9 — Matriz de roles y dataset sintético

## 0. Encabezado

- Issues: #29 Matriz roles, permisos · #9 Dataset sintético (Configuración 1 y 2)
- Dueño: Carlos
- Fechas: #29 2026-10-13 → 2026-10-16 · #9 2026-10-13 → 2026-10-23
- Nota: trabaja en paralelo con Emmanuel (#7). La matriz se integra como datos cuando esté lista, sin bloquear el arranque.
- Prioridad / Tipo / Épica: alta / tarea / Autenticación (#29), QA/Documentación (#9)
- Requisitos: RF-06 (#29) · RNF-02, RNF-07 (#9)
- Bloqueado por: `proyecto/CASO.md` (organigrama real de la planta), #7 Configuración 1 (familias a mapear)
- Bloquea a: #5 RBAC, #23 contrato de datos (#29) · #32 OCR, #3 pipeline, #6 pruebas (#9)

## 1. Contexto

DOCU decide en servidor quién ve y confirma qué: empresa → departamento → rol →
persona (RF-06, ADR-0006). Los roles de la planta (su organigrama real) no son
los roles del sistema: cada empresa mapea los suyos a los roles base como datos
(RF-08), sin crear roles nuevos en código. Y todo se prueba con datos sintéticos
de la planta Baja SterilPack, porque no hay datos reales (`proyecto/CASO.md`).

## 2. Por qué importa tu parte

La matriz es insumo directo del modelo de datos: sin ella no se congela el
contrato del 30 de octubre (ADR-0012). El dataset alimenta la evaluación de OCR
de Erik (#32), el pipeline (#3) y todas las pruebas de cierre (#6). Sin
dataset, ningún requisito se puede demostrar.

## 3. Objetivo y resultado esperado

| Entregable | Evidencia |
|---|---|
| Matriz de roles y permisos | `docs/proyecto/ROLES.md`: distinción planta/sistema, catálogo base, receta de mapeo para C2 y tabla rol × acción (ver, subir, confirmar, configurar) × alcance (propio, departamento, empresa) |
| Usuarios demo | 3 usuarios de roles distintos descritos en `ROLES.md` |
| Primer lote de escaneados para #32 | 10 escaneados + CSV de *ground truth*, entregados a Erik antes del 2026-10-16 |
| Dataset Configuración 1 | ~200 archivos (5 familias × 40: 100 válidos, 60 con error, 40 escaneados) generados por `bun dataset/generar.ts --seed 42`; C2 reutiliza el generador con otra config |
| Plan y casos de prueba base | `docs/ingenieria/PRUEBAS.md`: caso por RF con su evidencia esperada |

## 4. Actividades específicas

1. Fijar la regla planta/sistema: el código solo conoce 4 acciones × 3
   alcances (cerrado); roles y mapeo organigrama→rol son datos (RF-08,
   ADR-0009). Si un puesto no encaja, cae al rol base más restrictivo + aviso;
   jamás se crea un rol en código por una empresa. Terminado: principio escrito
   en `ROLES.md` con ejemplo de mapeo para Configuración 2.
2. Escribir la matriz desde los roles base (`admin`, `planeacion`, `calidad`,
   `almacen`, `ingenieria/MODELO-DATOS.md`) y las reglas R-Q1 (solo calidad
   libera, como dato, no como `if`) y R-P1..P4. Terminado: cada regla del caso
   tiene un rol responsable.
3. Revisar la matriz con Kira (qué ve cada rol en pantalla) y Emmanuel (#5)
   antes del 2026-10-15. Terminado: objeciones resueltas o anotadas.
4. Escribir el generador `dataset/generar.ts` con semilla fija:
   plantillas por familia en `dataset/plantillas/` (Excel con `xlsx`, PDF con
   `pdf-lib`, correos `.eml`, escaneados por render + degradado 150/300 dpi con
   Sharp/ImageMagick). El script emite también el CSV de *ground truth*.
   Se commitea script + config + CSV; los binarios no (`.gitignore`).
   Terminado: `bun dataset/generar.ts --seed 42` regenera idéntico.
5. Generar el primer lote para #32 (10 escaneados + CSV) y entregarlo a Erik.
6. Escribir el plan de pruebas a partir de "Pruebas que exige cada requisito"
   en `REQUISITOS.md`.

## 5. Entradas y salidas

- Recibe: caso y reglas (`CASO.md`, `CONTEXTO.md`), familias (`MODELO-DATOS.md`).
- Entrega: matriz a Emmanuel y Kira; escaneados + CSV a Erik (#32); dataset y plan a
  todo el equipo, por PR.

## 6. Referencias y caja de herramientas

- `docs/proyecto/CASO.md`, `REQUISITOS.md`, `CONTEXTO.md`.
- ADR-0006 (permisos en servidor) y ADR-0009 (reglas como datos).
- Automatizable: script TypeScript/Bun con semilla; plantillas versionadas;
  degradado con Sharp/ImageMagick; nunca archivos a mano ni CSV a mano.

Recursos oficiales para implementar:

| Para | Recurso | Cuándo usarlo |
|---|---|---|
| Datos sintéticos en español | https://fakerjs.dev (API + semilla; `faker.seed()`) | Al generar nombres, RFC, medidas y textos del dataset |
| Excel realista | https://docs.sheetjs.com (lectura/escritura `xlsx`, fórmulas) | Al crear `excel_turno` y `programa_planeacion` con fórmulas |
| PDF con layout | https://pdf-lib.js.org (crear y sellar PDFs) | Al crear recepciones y certificados |
| Degradado a 150/300 dpi | https://sharp.pixelplumbing.com + https://imagemagick.org (ruido, blur, rotación leve) | Al simular escaneados desde el render limpio |
| Entender qué medirá el OCR | Tesseract https://tesseract-ocr.github.io y Docling OSS https://github.com/docling-project/docling (Linux Foundation) | Al diseñar el *ground truth* (qué campos son legibles a cada dpi) |
| Modelo de permisos | OWASP Cheat Sheet Series https://cheatsheetseries.owasp.org (Authorization) + NIST SP 800-162 (ABAC) | Al escribir `ROLES.md` sin inventar el modelo |
| Patrones de validación | Curaduría del equipo: https://regex101.com (probar patrones de folio, medida, `rollo_id`) | Al definir qué dato es válido y al generar errores realistas |
| Dar forma a CSV/JSON | Curaduría del equipo: https://transform.tools y https://jsoncrack.com (ver el *ground truth* como grafo) | Al emitir y depurar el CSV de verdad |
| Elegir paquetes por peso | Curaduría del equipo: https://npmtrends.com y https://bundlephobia.com (`xlsx` vs `exceljs`, `pdf-lib`, `sharp`) | Al fijar dependencias del generador |
| Referencia JS | https://devdocs.io y https://developer.mozilla.org | Al escribir `dataset/generar.ts` (seed, fechas, aleatorios) |
| Datos falsos sin programar | https://mockaroo.com (CSV/JSON con tipos y locales, exportable) | Al prototipar el *ground truth* antes del script final |
| Español realista | https://fakerjs.dev (locale `es`: nombres, direcciones, empresas) | Al configurar el generador para que parezca planta mexicana |
| Modelo de autorización (solo lectura) | https://casbin.org (RBAC/ABAC como referencia, no como dependencia) | Al validar que la matriz cubre todo sin inventar el modelo |

## 7. Cómo trabajar

- `/tarea 29`, luego `/tarea 9`; `/cerrar` en cada una. Un issue en progreso a la vez.
- Todo lo generado lleva semilla o versión.

## 8. Criterios de aceptación

- [ ] `ROLES.md` trae distinción planta/sistema, catálogo base, receta de mapeo C2, y cubre los 4 roles, las 4 acciones y las 7 reglas del caso.
- [ ] Erik confirma en #32 que recibió los escaneados con *ground truth*.
- [ ] `bun dataset/...` (comando documentado) regenera el dataset idéntico.
- [ ] `PRUEBAS.md` tiene un caso por RF.
- [ ] `bun run verify` en verde en cada PR.

## 9. Riesgos nombrados

#29 ya está vencida y bloquea el contrato de datos. Mitigación: entregar la
matriz primero (antes del 2026-10-16) y el dataset después.

## 10. Revisión

Viernes 2026-10-16 (matriz y escaneados) y viernes 2026-10-23 (dataset y plan),
con Erik.

Replanificación 2026-10-09: #29 cierre 16-oct; #9 12→23-oct; lote 10 escaneados a Erik antes del 16-oct.
Revisión 2026-10-09: roles planta/sistema como datos (RF-08); generador con plantillas + CSV automático; escaneados a Erik (era Emmanuel); contrato 30-oct.
