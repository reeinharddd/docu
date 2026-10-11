# Playground de kira

> Rama aislada para iteración libre de diseño. **Nunca se fusiona a `main`.**

## Arranque (1 comando)

```bash
cd playground && bun install && bun run start
```

## Estructura

```
playground/
├── src/          ← Prototipo Angular 22 + Tailwind 4 (vacío, se llena cuando kira arranque)
├── tokens/       ← Paleta, tipografía, espaciado (vacío, se llena con la marca elegida)
├── DESIGN.md     ← Insumos llenados por kira (copiado de plantilla)
├── AGENTS.md     ← Reglas de exploración libre (copiado de plantilla)
└── README.md     ← Este archivo
```

## Reglas

- **Nunca fusionar a `main`.** Lo decidido viaja a `docs/diseno/` por PR.
- Sin API ni BD. Solo tokens y mockups.
- Exploración libre: cambiar paleta, tipografía, layout sin pedir permiso.
- Ver `AGENTS.md` para reglas completas.

## Estado

🟡 Esqueleto listo. Esperando a que kira termine Fase 1 (marca) para llenar DESIGN.md y empezar a iterar.
