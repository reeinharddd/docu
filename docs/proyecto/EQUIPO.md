# Equipo, responsabilidades y propiedad de la documentación

Estado: vigente. Última actualización: 2026-10-06.

## Personas

| Persona | Rol en DOCU | Áreas del sistema | Usuario GitHub |
|---|---|---|---|
| Erik Alfonso Beltrán Ramírez | Líder, infra y pipeline | `auth/governance`, despliegue, CI, entorno, ADRs de infraestructura | `reeinharddd` |
| Emmanuel Valenzuela Cruz | Backend | API NestJS, ingesta, dato oficial, RBAC, reglas declarativas | pendiente |
| Kira Llizara Garfias González | Frontend y UX | Angular, Tailwind, captura, bandeja, programa, búsqueda, diseño de pantallas | pendiente |
| Carlos Ariel Martín Rojas | Dataset y QA | Dataset sintético, Configuración 1 y 2, plan de pruebas, evidencias | pendiente |

Materias: **Yakko Olivo Nájera** (Desarrollo web integral) es dueño del
producto y sus entregas viven en DOCU. **Resffa Elizabeth Fierro García**
(Extracción de Conocimiento de BD) también. **Laura Trejo Medina**
(Administración de Proyectos) solo aparece en el tablero de EC0935, nunca aquí.

## Responsabilidades y entregables en E1

Hasta cerrar las dos puertas de ADR-0012 (design system y modelo de datos) no se
construye producto. Esto es lo que cada persona debe entregar ahora. El detalle
está en su brief y el estado en su issue.

| Persona | Responsable de | Próximos entregables | Fecha | Brief |
|---|---|---|---|---|
| Kira | Experiencia y diseño | Prototipos y flujo de pantallas (#11), categorías y etiquetas (#28); después design system de marca (#41) | 2026-10-09 / 10-23 | `briefs/BRIEF-11-prototipos-ui-ux.md` |
| Emmanuel | Backend e ingesta | Evaluación de OCR con números (#32); después arquitectura y APIs (#12), solo-insert (#44) y pruebas de la API (#45) | 2026-10-12 | `briefs/BRIEF-32-evaluacion-ocr.md` |
| Carlos | Datos y calidad | Matriz de roles (#29, vencida), escaneados para #32, dataset y plan de pruebas (#9) | 2026-10-09 / 10-16 | `briefs/BRIEF-29-matriz-roles-y-dataset.md` |
| Erik | Liderazgo, infra y gestión | Gestión del Project (#43), playground de diseño (#42), arquitectura y entorno (#10), SRS (#13), aprobación de requisitos (#30), cotizaciones (#31, #33), worker (#46), revisión de todos los PR | 2026-10-09 / 10-16 | — |

Sin responsable todavía: #36 (diagrama de casos de uso) y #39 (reporte y
alerta, RF-05). Se asignan en el sync del lunes.

Cómo empieza cualquiera: `bash scripts/setup.sh`, `opencode`, `/inicio`
(`operacion/BOOTSTRAP.md`).

## Quién escribe qué documento

Regla: si eres el dueño del tema, escribes el documento; si no, lo pides. Nadie
edita un documento de otro sin avisar en el PR.

| Documento | Dueño | Revisor mínimo |
|---|---|---|
| `proyecto/VISION.md` | Erik | Todo el equipo en el PR |
| `proyecto/CASO.md` | Erik + equipo | Quien trabaje el dominio |
| `proyecto/REQUISITOS.md` | Erik | Quien va a construir el requisito |
| `proyecto/EQUIPO.md` | Erik | Quien cambia de rol |
| `decisiones/ADR-*.md` | Quien decide | Erik (infra) o el dueño del módulo |
| `ingenieria/ARQUITECTURA.md` | Erik | Emmanuel |
| `ingenieria/MODELO-DATOS.md` | Emmanuel | Erik |
| `ingenieria/API.md`, `ingenieria/COLAS.md` | Emmanuel | Erik |
| `ingenieria/ENTORNO.md` | Erik | Erik (bloqueante en PR) |
| `diseno/*.md` | Kira | Erik (coherencia de alcance) |
| `operacion/*.md` | Erik | Quien lo vaya a sufrir |
| `integraciones/GITHUB-GESTION.md` | Erik | Erik (cambios de estructura requieren su OK) |
| `integraciones/DRIVE.md`, `GITHUB.md`, `MCP.md` | Erik | — |
| `integraciones/ENGRAM.md` | Erik | — |
| `gestion/*` | Erik | Todo el equipo en el PR |
| `academico/ENTREGAS.md` | Erik | Responsable de la entrega |
| `diario/AAAA-MM-DD.md` | Quien decidió | Nadie: es append |

## Forma de trabajo

- Ramas: `feat/<issue>-<slug>` desde `main` (`gh issue develop N`); nada directo a `main`.
- PR pequeño, un cambio lógico, 1 revisor, CI en verde, evidencia adjunta.
- Definición de hecho: PR aprobado + pruebas del RF en verde + evidencia +
  issue etiquetado con su RF y cerrado por el PR.
- 1 issue `En progreso` por persona. Bloqueo > 24 h se escala con etiqueta.
- Sync lunes y viernes: qué moví, en qué estoy, qué me bloquea.
- Toda delegación usa `plantillas/BRIEF.md` y se enlaza desde su issue.

## Sobre las credenciales

Cada máquina tiene su `.env` local con las credenciales de Google. La gestión
usa la cuenta de GitHub de cada quien, sin tokens extra. **Nunca al repositorio.** `.env.example` documenta cada variable
existente; el líder reparte los valores. Ver `integraciones/` para qué se usa
cada una y con qué permiso.

## Project Management

GitHub es el centro único de operación del equipo: issues, milestones y Project
del repositorio (`decisiones/ADR-0008-github-como-gestor-del-equipo.md`). El
repositorio es también la fuente de verdad técnica; Google Drive es el espejo
administrativo de las entregas. Monday se dio de baja tras migrar todo su contenido.
Detalle en `integraciones/GITHUB-GESTION.md`.

## Referencias

- Visión: `proyecto/VISION.md`
- Plan con fechas: `gestion/PLAN-EPICAS.md`
- Ritmo y proceso: `gestion/RITMO-SEMANAL.md`