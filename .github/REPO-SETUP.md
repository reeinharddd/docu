# Checklist dia del repo (hacer una sola vez, en orden)

- [ ] Crear repo privado `docu`, push unico de esta base.
- [ ] Proteger `main`: PR obligatorio + CI en verde + 1 revisor, sin push directo.
- [ ] Invitar a los 3 colaboradores con rol Write.
- [ ] Poner usuarios reales en `.github/CODEOWNERS`.
- [ ] Instalar app Renovate en el repo. NO crear `dependabot.yml` (duplicaria PRs).
- [ ] Cada quien: clonar, `bun install`, `lefthook install`, copiar `.env`.
- [ ] Verificar CI verde en el primer PR.
- [ ] `gh auth refresh -s project` y crear el Project `DOCU` (`docs/integraciones/GITHUB-GESTION.md`).
