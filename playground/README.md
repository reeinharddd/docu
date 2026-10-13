# Playground de Kira

> Rama aislada para iteración libre de diseño. **Nunca se fusiona a `main`.**

## Arranque (1 comando)

```bash
cd playground && bun run start
```

Abre http://localhost:4200 (`PLAYGROUND_PORT` para cambiarlo). Sin dependencias:
`funciona offline`, `bun install` no descarga nada.

## Probar una paleta en <5 min

1. Edita `tokens/tokens.css` (`:root`).
2. Guarda y recarga el navegador.
3. Nada más. Si tardaste más, avisa en #42: es bug del playground.

`tokens/tokens.json` es la fuente DTCG; `tokens.css` se mantiene a mano
desde ahí hasta que haya pipeline (23-oct).

## Estructura

```
playground/
├── src/index.html   ← Página de tokens + previews (paleta, componentes, tipografía)
├── tokens/          ← tokens.css (vivo) + tokens.json (fuente DTCG)
├── server.ts        ← Servidor estático Bun, cero dependencias
├── DESIGN.md        ← Insumos de Kira (se llena en Fase 1)
├── AGENTS.md        ← Reglas de exploración libre
└── PROMOCION.md     ← Checklist para llevar decisiones a docs/diseno/
```

## Capturas

Cada iteración se captura contra el servidor local (comparar antes/después).
Flujo automático el 23-oct; mientras tanto, captura manual y adjunta al PR.

## Reglas

- **Nunca fusionar a `main`.** Lo decidido viaja a `docs/diseno/` por PR (ver PROMOCION.md).
- Sin API ni BD. Solo tokens y mockups.
- Exploración libre: cambiar paleta, tipografía, layout sin pedir permiso.
- Ver `AGENTS.md` para reglas completas.

## Estado

🟢 Usable 13-oct: 1 comando + página de tokens + no-merge. Angular real tras
la marca elegida (Fase 1); capturas auto y pipeline de tokens el 23-oct.
