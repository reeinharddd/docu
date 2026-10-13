# Rama `design/kira-playground`

> **⚠️ ESTA RAMA NUNCA SE FUSIONA A `main`.**
> Rama huérfana (sin historial compartido con `main`). Solo contiene el playground.

## Qué es

Rama aislada donde kira itera paletas, tipografías, layouts y prototipo navegable con IA, sin contaminar `main` ni violar ADR-0012.

## Cómo usar

1. Kira abre esta rama: `git checkout design/kira-playground`
2. Llena `playground/DESIGN.md` con los insumos (visión, paleta, tipografías, etc.)
3. Itera libremente en `playground/src/` (Angular 22 + Tailwind 4)
4. Captura cada iteración para comparar
5. Cuando el prototipo esté listo, promueve a `main` por PR a `docs/diseno/`

## Arranque (1 comando)

```bash
cd playground && bun install && bun run start
```

## Estructura

```
design/kira-playground/      ← Solo esto existe en la rama. Nada de main.
├── playground/              ← Subdirectorio aislado (su propio package.json)
│   ├── src/                 ← Prototipo Angular (vacío hasta que kira arranque)
│   ├── tokens/              ← Tokens de la marca elegida (vacío hasta Fase 1)
│   ├── DESIGN.md            ← Insumos (copiado de plantilla, pendiente de llenar)
│   ├── AGENTS.md            ← Reglas de exploración (copiado de plantilla)
│   ├── package.json         ← Dependencias del playground (independiente)
│   └── README.md            ← Cómo arrancar
└── README-PLAYGROUND.md     ← Este archivo
```

## Reglas

| Regla | Por qué |
|---|---|
| Nunca fusionar a `main` | ADR-0012: no contaminar el repo central |
| Sin API ni BD | BRIEF-42: solo tokens y mockups |
| Lo decidido viaja por PR a `docs/diseno/` | Trazabilidad y revisión |
| Rama huérfana (sin historial de `main`) | Aislamiento total: nada de `main` existe aquí |

## Estado

🟢 Usable 13-oct: `bun run start` sirve la página de tokens + previews; paleta temporal hasta Fase 1. Angular real, capturas auto y pipeline de tokens el 23-oct.
