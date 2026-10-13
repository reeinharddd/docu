# Playground de Kira

> Rama aislada para iteración libre de diseño. **Nunca se fusiona a `main`.**

## Arranque (1 comando)

```bash
cd playground && bun install && bun run start
```

Abre http://localhost:4200. App Angular 22 zoneless + Tailwind 4, espejo de
`apps/web` (mismas versiones, mismos configs). Primera vez descarga
dependencias; después funciona offline.

## Probar una paleta en <5 min

1. Edita `tokens/tokens.css` (`:root`).
2. Guarda y mira el browser (watch recarga solo).
3. Nada más. Si tardaste más, avisa en #42: es bug del playground.

`tokens/tokens.json` es la fuente DTCG; `tokens.css` se mantiene a mano
desde ahí hasta que haya pipeline (23-oct).

## Estructura

```
playground/
├── ng/              ← App Angular espejo (serve :4200, build verificado)
├── tokens/          ← tokens.css (vivo) + tokens.json (fuente DTCG)
├── DESIGN.md        ← Insumos de Kira (se llena en Fase 1)
├── AGENTS.md        ← Reglas de exploración libre
├── CONSISTENCIA.md  ← Cadena tokens→componentes→pantallas (obligatoria)
├── FLUJO.md         ← Técnica de trabajo (ciclo, skills, realtime, delegación)
└── PROMOCION.md     ← Checklist para llevar decisiones a docs/diseno/
```

## Técnica de trabajo

Ver `FLUJO.md`: ciclo proponer → ver → comparar → afirmar, skills por fase,
browser en tiempo real con capturas, subagentes `explorador`/`revisor`.

## Capturas

Cada iteración se captura contra el servidor local (comparar antes/después)
con `snapmcp` o `playwright`. Flujo automático el 23-oct; mientras tanto,
captura manual y adjunta al PR.

## Reglas

- **Nunca fusionar a `main`.** Lo decidido viaja a `docs/diseno/` por PR (ver PROMOCION.md).
- Sin API ni BD. Solo tokens y mockups.
- Exploración libre: cambiar paleta, tipografía, layout sin pedir permiso.
- Ver `AGENTS.md` para reglas completas.

## Estado

🟢 Usable 13-oct: Angular espejo + tokens + no-merge + opencode equipado.
Capturas auto y pipeline de tokens el 23-oct.
