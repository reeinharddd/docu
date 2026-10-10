#!/usr/bin/env bash
# DOCU drive-check: verifica lectura de Google Drive en vivo, solo lectura.
# Exit 0: carpeta + 3 etapas resuelven. Exit 2: omitido (sin credenciales o sin
# red). Exit 1: credenciales presentes pero lectura falla. Nunca imprime secretos.
set -u
cd "$(dirname "$0")/.."

[ -f .env ] || { echo "OMITIDO: sin .env (cp .env.example .env)"; exit 2; }
set -a; . ./.env; set +a

for k in GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET GOOGLE_REFRESH_TOKEN GOOGLE_DRIVE_FOLDER; do
  [ -n "${!k:-}" ] || { echo "OMITIDO: $k ausente (lo entrega el líder)"; exit 2; }
done

jget() { bun -e 'let t="";for await(const c of Bun.stdin.stream())t+=new TextDecoder().decode(c);const v='"$1"';console.log(v??"")'; }

token=$(curl -fsSL --max-time 15 -X POST https://oauth2.googleapis.com/token \
  --data-urlencode "client_id=$GOOGLE_CLIENT_ID" \
  --data-urlencode "client_secret=$GOOGLE_CLIENT_SECRET" \
  --data-urlencode "refresh_token=$GOOGLE_REFRESH_TOKEN" \
  --data-urlencode "grant_type=refresh_token" 2>/dev/null) || { echo "OMITIDO: sin red hacia Google"; exit 2; }
access=$(printf '%s' "$token" | jget 'JSON.parse(t).access_token')
[ -n "$access" ] || { echo "FALLO: OAuth no devolvió access_token (credencial inválida)"; exit 1; }

api() { curl -fsSL --max-time 15 -H "Authorization: Bearer $access" "$@"; }
lista=$(api -G "https://www.googleapis.com/drive/v3/files" \
  --data-urlencode "q='$GOOGLE_DRIVE_FOLDER' in parents and trashed=false" \
  --data-urlencode "fields=files(id,name)" 2>/dev/null) || { echo "FALLO: no se pudo listar la carpeta"; exit 1; }
echo "carpeta: $(printf '%s' "$lista" | jget 'JSON.parse(t).files.length') objeto(s)"
printf '%s' "$lista" | jget 'JSON.parse(t).files.map(f=>"- "+f.name).join("\n")'

for id in 1iVX0RocK85_4uzrQYUtaM4pVU-4hPYpk1fCFp6ULsBg 16aVye0h5sgC5Cdc_7WDJQ8AqHxw5Q5RR 1_eXJG0jkVazBxQ2Hawu697Pk8KxbmK4B; do
  nombre=$(api "https://www.googleapis.com/drive/v3/files/$id?fields=name" 2>/dev/null | jget 'JSON.parse(t).name') || { echo "FALLO: etapa $id no resuelve"; exit 1; }
  [ -n "$nombre" ] || { echo "FALLO: etapa $id no resuelve"; exit 1; }
  echo "etapa: $nombre"
done
echo "drive OK"
