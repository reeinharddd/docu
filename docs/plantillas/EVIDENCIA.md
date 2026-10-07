# Plantilla de evidencia

La evidencia es lo que convierte "ya quedó" en hecho (REGLAS.md 7). Se adjunta
al PR, y el PR cierra su issue con `Closes #N`.

```markdown
# Evidencia — <ID de tarea o RF> — YYYY-MM-DD

Autor: <persona> · Máquina: <ubuntu 26.04 / macOS 15 / Windows 11>
Rama: <feat/RF-03-dato-oficial> · Commit: <sha corto>

## Qué se demuestra

Una frase: qué requisito o regla queda demostrado.

## Comandos y salida real

```text
$ bun run typecheck
web typecheck: Exited with code 0
@docu/api typecheck: Exited with code 0

$ curl -s localhost:3000/health
{"status":"ok","postgres":"up","redis":"up"}
```

Copiar la salida real, no una descripción. Si la salida es larga, pegar solo
la parte que demuestra el punto y decir dónde está el resto.

## Capturas o video

Una referencia por evidencia visual, con fecha. No adjuntar el mismo pantallazo
de siempre: la evidencia útil es la del estado final correcto.

## Qué NO se demuestra

Honestidad explícita. Deja registrado lo que sigue pendiente y por qué; evita
que alguien declare completo algo que no lo está.
```

Tipos de evidencia aceptados, en orden de fuerza: comando con salida, captura,
video corto, documento generado, o logs de CI del run que lo demuestra.