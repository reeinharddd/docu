<p align="center">
<strong>docu</strong><br>
<sub>Configuración 1 · Baja SterilPack · DOCU — Repositorio de Documentación Digital</sub><br>
<sub>Marca: <code>#5B2A86</code> · acento: <code>#B0215F</code> · texto: <code>#24172F</code></sub>
</p>

# Plantilla de spec

Se llena en menos de diez minutos y vive en el brief de la tarea o, si no hay
brief, se copia a `docs/briefs/SPEC-<N>-<slug>.md` y se enlaza desde la PR
(ADR-0018). Sin spec no hay PR: la puerta `sdd-tdd / spec` la exige.

```markdown
# SPEC #<N> — <comportamiento en una frase>

Issue: #<N> · Dueño: <quien> · Fecha: YYYY-MM-DD

## Comportamiento

<Qué debe pasar, en 1-3 frases. Qué entra, qué sale, quién lo usa.>

## Criterios (Given/When/Then)

1. **Given** <estado inicial>, **when** <acción>, **then** <resultado observable>.
2. **Given** ..., **when** ..., **then** ...

## Fuera de alcance

<Qué NO hace esta tarea, para que nadie la pida en el PR.>

## Plan de pruebas

<Las pruebas que se escriben primero (test rojo) y cómo se corre la suite.>

## Listo cuando

<Las 2-4 condiciones verificables que cierran el issue.>

## Evidencia esperada

<Comando, captura o video que un tercero puede repetir en 10 minutos.>
```

Reglas: criterios observables (no "funciona bien"); fuera de alcance siempre
presente; el plan de pruebas se escribe **antes** del código — si no sabes
cómo probarlo, aún no sabes qué construir.
