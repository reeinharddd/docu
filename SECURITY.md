# Politica de seguridad — DOCU

Proyecto escolar, repo privado, datos ficticios. Aun asi operamos como produccion.

## Versiones soportadas

| Version | Soporte |
|---|---|
| main | Recibe parches de seguridad |
| tags de entrega | Solo lectura historica, sin parches |

## Como reportar

Siempre en issue con etiqueta seguridad (solo visible al equipo), nunca en el chat. Dirigido al lider con: descripcion, pasos para reproducir, impacto y evidencia. El lider confirma recepcion en 24 h y propone plan en 72 h.
Un secreto filtrado se rota el mismo dia.

## Alcance

Si entra: auth y RBAC en servidor, JWT y sesiones, validacion de
archivos (MIME, tamano), inyecciones, XSS, secretos en repo/imagenes/logs,
permisos entre departamentos.
No entra: passwords demo locales, falta de HTTPS en localhost,
fallas en dependencias sin parche disponible.

## Reglas que ya nos protegen

- `.env` solo local; CI falla si aparece en el repo (gitleaks + hook).
- Auth real y permisos en servidor (M1/M2); el front solo oculta.
- Demo en red local; nube solo con configuracion explicita.
- Bitacora e historial solo crecen, no se editan ni borran.
- `main` protegida: sin push directo, todo por PR con CI verde.

## Severidad (el lider clasifica al recibir)

- Critica: acceso a datos de otro departamento, RCE, secreto real filtrado.
- Alta: escalada de rol, auth rota, XSS con robo de sesion.
- Media/Baja: lo demas; se agenda al siguiente sprint.

## El reporte debe traer

- Commit o fecha, entorno (local, demo), pasos para reproducir.
- Impacto (que ve/hace un atacante) y evidencia. Fix sugerido, opcional.
- Nada de pruebas destructivas contra la demo compartida.

## Compromiso

No se publica nada antes del fix. Cada parcial se revisa esta politica.
Dueno del documento: lider del equipo. Ultima revision: 2026-10-05.
