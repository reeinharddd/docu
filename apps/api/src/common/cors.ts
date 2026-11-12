// CORS policy — explicit allowlist (SEC-01, auditoría 2026-11-11).
//
// Ningún origen se refleja por defecto: `origin: true` devolvía el origen
// que pidiera el cliente junto con credenciales, que no es política de
// producción. `CORS_ORIGINS` lleva la lista explícita, separada por comas;
// vacía u ausente significa "no reflejar ningún origen cross-origin"
// (curl/scripts siguen funcionando: CORS es control del navegador).

export function parseCorsOrigins(raw: string | undefined): string[] | false {
  if (raw === undefined || raw === '') {
    return false
  }
  const origins = raw
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin !== '')
  return origins.length > 0 ? origins : false
}
