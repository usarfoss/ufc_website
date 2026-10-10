#!/usr/bin/env bash
# Brings a standby database up to date with a backup that was just taken and checked.
#
#   ./scripts/refresh-standby.sh <backup.dump> <standby-database-url>
#
# It refuses to touch a standby that has been promoted (that is, one the site is now using as its real database). Promoting means creating a
# table called _standby_promoted in it (see docs/runbooks/failover-to-standby.md), and from then on this script leaves it alone: otherwise
# the next scheduled run would overwrite the live database with an older copy of the old one.
set -euo pipefail

dump="${1:?usage: refresh-standby.sh <backup.dump> <standby-database-url>}"
standby="${2:?usage: refresh-standby.sh <backup.dump> <standby-database-url>}"

promoted="$(psql "$standby" -At -c "select to_regclass('public._standby_promoted') is not null")"
if [ "$promoted" = "t" ]; then
  echo "::warning::This standby has been promoted, so it is NOT being refreshed."
  exit 0
fi

pg_restore --no-owner --no-privileges --clean --if-exists --schema=public --dbname "$standby" "$dump"
echo "Standby refreshed from $dump."
