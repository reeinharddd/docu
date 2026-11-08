<p align="center">
<strong>docu</strong><br>
<sub>Configuración 1 · Baja SterilPack · DOCU — Repositorio de Documentación Digital</sub><br>
<sub>Marca: <code>#5B2A86</code> · acento: <code>#B0215F</code> · texto: <code>#24172F</code></sub>
</p>

# Ingeniería: contrato de datos congelado (SHA)

Estado: vigente. Mecanismo del issue #23. El contrato de datos de C1 queda
congelado con SHA-256 verificable, para que **dataset, seed y API hablen el
mismo idioma** (REPLAN-2026-10-30 §5).

## 0. Qué es el contrato

El contrato es el conjunto de archivos que definen la forma de los datos. Hoy
son **8 archivos**:

| Archivo | Qué fija |
|---|---|
| `docs/ingenieria/fichas/CONTRATO.md` | El contrato común de las 6 familias: identificadores, ground truth, multidominio, clases de resultado, ventana y volumen, ruido |
| `dataset/config1/esperado.json` | La expectativa del dataset del mes: ventana 5–30-oct, 60 turnos, conteos por familia, ruido 30–40 |
| `dataset/config1/esquemas/*.schema.json` (6) | El esquema de máquina de cada familia (JSON Schema draft 2020-12): `excel_turno`, `recepcion_rollo`, `programa_planeacion`, `inventario`, `correo_hermana`, `escaneado` |

Los ejemplos (`*.valido.json`, `*.invalido.json`) y el corpus generado no son
parte del contrato: cambian con cada corrida del generador (#61) sin romperlo.

## 1. Cómo se congela y se verifica

- `bun run contrato:freeze` recalcula el SHA-256 de cada archivo y escribe el
  manifest `dataset/config1/contrato-sha.json`, con el **SHA del contrato
  completo** en `contract_sha`. El manifest no lleva fechas: congelar dos
  veces el mismo contenido produce los mismos bytes.
- `bun run contrato:check` recalcula y compara contra el manifest. Está en la
  cadena de `bun run verify` y por tanto en CI: **nadie cambia el contrato sin
  que el PR lo declare**. Si algo cambia sin refrescar el manifest, el check
  falla con la lista de archivos en drift.

El SHA del contrato vigente vive en la primera línea del manifest y en el
issue #23:

```text
contract_sha = aee0f552eb3f6dae5e1c608a9035642bf4d90ed1deb482d831af7f76bc502ca8
```

## 2. Cómo cambia el contrato (cuando de verdad debe cambiar)

1. El PR que cambia un archivo del contrato corre `bun run contrato:freeze`
   en el mismo cambio y sube el manifest nuevo.
2. El cuerpo del PR nombra el `contract_sha` anterior y el nuevo.
3. Se registra el SHA nuevo en el issue #23 con la fecha y el PR.
4. Consumidores (#59 seed, #61 dataset, #12 API, #62 modelo) revisan el
   impacto: un cambio de contrato se anuncia, nunca se cuela.

Un cambio de contrato **no** es lo mismo que cambiar valores del dataset: el
contrato define la forma; los datos los produce #61. Regenerar el corpus con
otra semilla no toca el contrato
(criterio 2 de `BRIEF-62-modelo-datos.md`).

## 3. Con qué se alinea

| Consumidor | Cómo usa el contrato |
|---|---|
| #61 dataset | Genera el corpus que cumple `esperado.json` y los esquemas |
| #59 seed | Carga familias y reglas con la forma de los esquemas |
| #12 API | Valida la entrada contra los esquemas de cada familia |
| #62 modelo | El modelo documentado no contradice al contrato; su criterio de listo exige este SHA |

## Referencias

- `fichas/CONTRATO.md` (contrato humano, aprobado el 2026-10-17, issue #9)
- `../../dataset/config1/README.md`
- [MODELO-DATOS.md](MODELO-DATOS.md) · [DIAGRAMA-BD-v0.md](DIAGRAMA-BD-v0.md)
