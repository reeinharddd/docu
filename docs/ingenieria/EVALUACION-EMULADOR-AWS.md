# Evaluación — Emulador de AWS para el despliegue

> Etapa 4 · 14-nov-2026 · pregunta de la entrega: evaluar
> [`aws/aws-emulator`](https://github.com/aws/aws-emulator) o similar para el
> despliegue de DOCU.

## Veredicto: no aplica a esta instalación — con motivo y disparador

DOCU **no consume ningún servicio de AWS**, así que no hay nada que emular.
El despliegue ya corre sobre piezas locales y libres, y así quedó probado en
la [Etapa 4](../operacion/ETAPA-4-PRUEBAS-Y-DESPLIEGUE.md):

| Necesidad | Lo que DOCU usa hoy | Equivalente AWS que *no* se usa |
|---|---|---|
| Almacenar los originales | disco local content-addressed por SHA-256 (`originales/<facilidad>/<sha256>.<ext>`, `DiskOriginalsStore`, `apps/api/src/files/disk-originals.store.ts`) | S3 |
| Colas del pipeline | Redis 8 + BullMQ (4 colas: `ingest`, `text`, `reports`, `alerts`) | SQS |
| Base de datos + vectores | PostgreSQL 18 + pgvector (docker compose de `infra/`) | RDS / Aurora |
| Servir la web + TLS | nginx (dev: proxy del dev server, PR #160) | ALB / CloudFront |
| Modelo central | NVIDIA NIM vía endpoint compatible OpenAI | Bedrock |

No hay ningún import de `aws-sdk`/`@aws-sdk` en el repo. Un emulador de APIs
que el sistema no llama añadiría una dependencia (Rust, ~100 GB de build si
se compila de fuente), tiempo de arranque y superficie de falla **sin cubrir
nada**.

## Qué es `aws/aws-emulator` (por si sirve después)

Emulador local **oficial** de las APIs de AWS (Rust, un crate por servicio,
sirve HTTPS en `127.0.0.1:9297` con certificado self-signed). Está pensado
para desarrollar y probar sin cuenta de AWS, apuntando el SDK/CLI a su
endpoint con variables de entorno. Dos límites que leemos de su propia
documentación:

1. **No es para producción ni para probar seguridad** — exactamente el tipo de
   validación que DOCU hace con su configuración real (RNF-03 se valida contra
   el endpoint de verdad, no contra un simulacro).
2. **Telemetría a AWS activada por defecto** — se apaga con `--telemetry`.
   Si alguna vez corre dentro de la planta, se corre con la telemetría
   apagada: es la misma política que RNF-03 aplica a cualquier componente.

## Disparador: cuándo sí entraría

Si la instalación migrara los originales a S3 (por volumen o política de la
planta), el cambio sería un `S3OriginalsStore` junto al `DiskOriginalsStore`
actual (mismo puerto `OriginalsStore`, #12). Ahí el emulador ganaría su
lugar, en este orden:

1. **Pruebas del store**: `PutObject/GetObject/DeleteObject` contra el
   emulador en CI, sin cuenta ni costo de AWS — y con la misma interfaz que
   después apunta al S3 real sólo cambiando el endpoint.
2. **DRP del bucket**: ensayar restauración y versionado de originales sin
   tocar el bucket real.
3. **SQS**, sólo si se abandonara BullMQ — no hay motivo hoy.

Reglas si eso ocurre: telemetría apagada, el emulador nunca corre en la
instalación de producción, y la prueba de seguridad de la Etapa 4 sigue
haciéndose contra la configuración real.
