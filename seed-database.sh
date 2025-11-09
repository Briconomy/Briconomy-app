#!/usr/bin/env bash
set -euo pipefail

log() {
  echo "[seed-database] $1"
}

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log "Missing required command: $1"
    exit 1
  fi
}

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$ROOT_DIR/scripts"

MONGO_URI="${MONGO_URI:-mongodb://127.0.0.1:27017}"
DB_NAME="${DB_NAME:-briconomy}"

require_command deno

if [ ! -d "$SCRIPTS_DIR" ]; then
  log "Scripts directory not found: $SCRIPTS_DIR"
  exit 1
fi

log "Resetting database '$DB_NAME' at '$MONGO_URI'"
MONGO_URI="$MONGO_URI" DB_NAME="$DB_NAME" \
  deno run -A - <<'EOF'
import { MongoClient } from "npm:mongodb";

const uri = Deno.env.get("MONGO_URI") ?? "mongodb://127.0.0.1:27017";
const dbName = Deno.env.get("DB_NAME") ?? "briconomy";

const client = new MongoClient(uri);
try {
  await client.connect();
  await client.db(dbName).dropDatabase();
  console.log(`[seed-database] Dropped database ${dbName}`);
} finally {
  await client.close();
}
EOF

log "Running seed scripts from $SCRIPTS_DIR"
mapfile -t SEED_SCRIPTS < <(find "$SCRIPTS_DIR" -maxdepth 1 -type f \( -name "*.js" -o -name "*.ts" \) | sort)

if [ "${#SEED_SCRIPTS[@]}" -eq 0 ]; then
  log "No seed scripts found in $SCRIPTS_DIR"
  exit 1
fi

PRIMARY_SCRIPT="$SCRIPTS_DIR/comprehensive-data-init.js"

if [ -f "$PRIMARY_SCRIPT" ]; then
  log "Executing $(basename "$PRIMARY_SCRIPT") (primary seed)"
  deno run -A "$PRIMARY_SCRIPT"
else
  log "Warning: primary seed script $(basename "$PRIMARY_SCRIPT") not found"
fi

for script_path in "${SEED_SCRIPTS[@]}"; do
  if [ "$script_path" = "$PRIMARY_SCRIPT" ]; then
    continue
  fi
  script_name="$(basename "$script_path")"
  log "Executing $script_name"
  deno run -A "$script_path"
done

log "Database seeding complete"
