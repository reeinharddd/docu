# Reglas del repo DOCU (E1)

1. Ramas: `main` (protegida) y `feat/<issue>-<slug>` desde `main`. Nada directo a `main`.
2. Todo PR lleva 1 revisor con respuesta en 24 h. Solo el dueño o su
   revisor mueve el issue; nadie tiene 2 issues En progreso a la vez.
3. Bloqueo >24 h se escala al líder con etiqueta `bloqueado`.
4. Secretos solo en `.env` (nunca en el repo). `.env.example` documenta
   cada variable.
5. `originales/` es solo lectura tras la ingesta. Nada se borra en silencio:
   lo dudoso va a cuarentena con motivo.
6. IA propone, humano dispone: ningún modelo publica dato oficial solo.
7. Definición de Hecho: PR aprobado + pruebas del RF en verde + evidencia
   adjunta (captura, bitácora o video) + issue etiquetado con su RF y cerrado por el PR.
   La descripción del PR cita el resultado de `bun run verify` en verde: sin
   evidencia no hay PR.
8. Commits convencionales (`feat:`, `fix:`, `docs:`, `chore:`), sin
   atribución a AI.
9. Sync lunes y viernes, 15 min: qué moví, en qué estoy, qué me bloquea.
