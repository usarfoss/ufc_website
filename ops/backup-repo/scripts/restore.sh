#!/usr/bin/env bash
# Loads a backup into a database.
#
#   ./scripts/restore.sh <backup.dump> <target-database-url> [--scratch]
#
# Needs pg_restore (the same major version as the database, or newer). If your file ends in .age, open it first:
#   age -d -i ~/ufc-backup-key.txt -o ufc.dump ufc-20261010T0617Z.dump.age
#
# It REPLACES the tables it finds in the target (--clean). Point it at a scratch database or at the database you mean to bring back, and
# nowhere else. Without --scratch it asks you to type the target's host name first, so a wrong address cannot go through by habit.
set -euo pipefail

dump="${1:?usage: restore.sh <backup.dump> <target-database-url> [--scratch]}"
target="${2:?usage: restore.sh <backup.dump> <target-database-url> [--scratch]}"
scratch="${3:-}"

host="$(printf '%s' "$target" | sed -E 's#^[a-z]+://[^@]*@([^/:?]+).*#\1#')"
if [ "$scratch" != "--scratch" ]; then
  echo "This will REPLACE the tables in the database on:  $host"
  read -r -p "Type that host name to continue: " typed
  [ "$typed" = "$host" ] || { echo "Not the same. Nothing was changed."; exit 1; }
fi

# --clean --if-exists: drop what the backup contains and recreate it, so the target ends up exactly as the backup was.
# --exit-on-error is left off on purpose: a scratch Postgres may lack roles that the dump mentions, and those are harmless.
pg_restore --no-owner --no-privileges --clean --if-exists --schema=public --dbname "$target" "$dump"
echo "Restored $dump into $host."
