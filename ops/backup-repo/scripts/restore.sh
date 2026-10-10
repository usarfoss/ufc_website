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
#
# It is all or nothing: the whole replacement runs as one transaction, so if anything goes wrong part way the target is left exactly as it
# was, never half old and half new.
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
# --single-transaction: do all of it in one transaction (this also makes it stop at the first error). Without it, a failure after the drops
# would leave the target with some tables gone and nothing to replace them. The dump has no owners or grants (--no-owner, --no-privileges
# when it was made), so there are no roles for it to trip over.
pg_restore --no-owner --no-privileges --clean --if-exists --single-transaction --schema=public --dbname "$target" "$dump"
echo "Restored $dump into $host."
