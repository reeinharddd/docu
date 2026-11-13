# Gestión: riesgos

Estado: vigente. Registro vivo. Ver `VISION.md` §Riesgos.

| Riesgo | Señal | Responsable | Mitigación | Estado |
|---|---|---|---|---|
| OCR no alcanza 90 % en scans del caso | Sin validación con scans reales (fase 2 diferida) | Erik | Fase 1 mide con corpus degradado propio; fase 2 (#61) cuando el líder la agende | abierto |
| Contrato 12-nov en riesgo | #58, #62 o #61 abiertos al 2026-11-07 | Erik / Carlos | El carril D cierra el 12-nov y el dataset el 17-nov; si el dataset se atrasa, el contrato se congela con el corpus disponible y se documenta el faltante | **Mitigado 2026-11-12**: #58/#62/#23 cerrados y merged; el riesgo remanente es solo #61 (en progreso, sesión paralela) |
| Entrega parcial del 15-nov y presentación del 17-nov (segunda evaluación, 40 pts) | Fecha límite domingo 15-nov 23:59; exige repo funcionando, seguridad DLP/DRP y respaldos, web services propios/de terceros y PDF de *Etapa 4* | Erik | Congelar alcance a la vertical mínima demostrable; mapear los requisitos de la actividad a lo ya construido; dueño y template del PDF definidos el 14-nov | **Abierto** (13-nov) |
| Documento *Etapa 4: Pruebas y despliegue* sin dueño | Template compartido por el profesor, nadie lo ha abierto | Erik | Redactar sobre evidencia existente (verify, CI, suites, contratos) y despliegue en el tercer parcial según la actividad | **Abierto** (13-nov) |
| Carriles sin PR merged (Kira, Carlos) | Cero PRs merged de cada uno en el histórico | Erik / Carlos | Primer PR pequeño y temprano de cada dueño antes del freeze para no descubrir fricción de integración el 16-nov | **Abierto** (13-nov) |
| #29 retrasa matriz | Sin `ROLES.md` al 2026-10-16 | Carlos | Alcance recortado a matriz; dataset es #9/#61 | **Cerrado 2026-10-17**: `ROLES.md` entregado, #29 y #9 cerrados |
| Sobrecarga Erik (5 cierres el 13-oct) | >1 En progreso | Erik | Si algo cede, que sea #43 (no bloquea contenido) | **Cerrado 2026-10-17**: #13 y #30 cerrados; #31/#33 descartados; #43 cerrado |
| Alcance Could frena Must | Tableros/voz en demo | Erik | Recorte MoSCoW por escrito en demo | abierto; con la reestructuración el alcance nuevo es el caso de ejemplo cerrado |
| Acelerar con IA sin red de seguridad | PR sin pruebas o sin spec cuando ya hay TDD | Erik | SDD y TDD en el brief de cada entregable; pruebas de API en CI (#45) | abierto (decisión del líder 2026-10-30) |
| Reestructurar sin cerrar el caso de ejemplo | El brief nuevo no fija criterios de Hecho del caso de ejemplo antes del 31-oct | Erik | Un brief por entregable; la exposición se arma sobre lo cerrado, no sobre lo pendiente | **Cerrado en la v2**: el caso cierra el 6-nov (#83) y su mapa de derivación es la entrada del ER, la plataforma y el dataset |
| Erik acumula frentes y revisa todo | Más de un frente suyo abierto a la vez | Erik | Orden interno A → B → C → D → E; nada nuevo después del 14-nov; guardarraíl de des-recorte (plan v2 §7) | abierto (plan v2) |
| La demo del 24-nov falla en vivo | Un fallo aparece en el ensayo del 20-nov | Erik | Freeze el 18-nov, ensayo el 20-nov, video de respaldo, modo degradado escrito, demo sin internet | abierto (plan v2) |
| La IA no alcanza en CPU | Páginas/min por debajo del umbral en el corpus de C1 | Erik | Se mide en el carril de infra IA; si no alcanza, la demo usa el corpus medido y se dice | abierto (plan v2) |
| La plataforma frontend bloquea a Kira | La base no está en `main` el 10-nov | Erik / Kira | Kira avanza con la spec de UI desde el 6-nov; el bloqueo real es de código, no de diseño | abierto (plan v2) |
| Dos modelos de datos en el repo | `MODELO-DATOS.md` contradice al ER | Erik | El híbrido manda; `MODELO-DATOS.md` se reescribe en el PR del ER (#58) | abierto (plan v2) |
