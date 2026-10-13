# CONTEXTO — DOCU (para trabajar solo con este repo)

## Caso
Planta ficticia de empaque médico flexible "Baja SterilPack" (5 máquinas,
3 turnos, ~140 personas). Planeación mezcla 3-4 sistemas y Excels con
fórmulas; plantas hermanas mandan mal o tarde; cada turno lleva su Excel.
DOCU consume esas fuentes, detecta familias, propone la versión oficial y
todo lo dudoso va a cuarentena con motivo. IA propone, humano dispone.
Nada se publica sin confirmación humana. Permisos en servidor (el front
solo oculta). Bitácora e historial solo crecen. Config 2 (segunda planta de la
misma compañía) debe cargarse sin cambiar código.

## Reglas del caso (datos, no código)
R-P1 sin certificado no se programa. R-P2 medida distinta no se programa.
R-P3 sin material bloquea fecha. R-P4 cambio de hermana dispara replan.
R-Q1 solo calidad libera. R-A1 paro mayor a 30 min exige motivo.
R-T1 stock mínimo bloquea orden.

## Arquitectura
Angular 22 zoneless + Tailwind (captura, bandeja, programa, búsqueda).
NestJS 12 modular (ingesta, validación en cadena, cuarentena, dato
oficial). PostgreSQL 18 + pgvector + JSONB, Redis 8 + BullMQ 6 (el OCR
corre solo en worker). TypeScript estricto punta a punta, bun full.

## Equipo y flujo
Carlos (datos+QA), Erik/líder (infra+pipeline+gestión+SRS), Kira (diseño+frontend),
Emmanuel (backend+BD). Briefs de cada tarea en `docs/briefs/` con el formato de
`docs/plantillas/BRIEF.md`. Estado del trabajo: GitHub Issues del repo
(`docs/integraciones/GITHUB-GESTION.md`).
Sin evidencia no hay "ya quedó".
