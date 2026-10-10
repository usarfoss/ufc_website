#!/usr/bin/env bash
# Takes one backup of the database, proves it can be restored, and encrypts it.
#
#   needs:  BACKUP_DATABASE_URL  direct address of the database, using the read-only ufc_backup login
#           AGE_PUBLIC_KEY       the public key (age1...) the file is encrypted to. Only the matching private key can open it.
#           RESTORE_CHECK_URL    optional: an empty scratch Postgres to test the restore in (the workflow provides one)
#   makes:  out/ufc-<time>.dump.age   (and leaves out/ufc-<time>.dump next to it for the steps that follow; delete it afterwards)
#
# What "proves it can be restored" means: the dump is loaded into a scratch database and the number of rows in every table is compared with
# the live database. A backup that cannot be restored is worse than none, because you believe you have one.
set -euo pipefail

: "${BACKUP_DATABASE_URL:?BACKUP_DATABASE_URL is not set}"
: "${AGE_PUBLIC_KEY:?AGE_PUBLIC_KEY is not set}"

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
out="${OUT_DIR:-out}"
mkdir -p "$out"
stamp="$(date -u +%Y%m%dT%H%MZ)"
dump="$out/ufc-$stamp.dump"

counts_sql="
select 'users', count(*) from users
union all select 'events', count(*) from events
union all select 'event_attendees', count(*) from event_attendees
union all select 'github_stats', count(*) from github_stats
union all select 'leetcode_stats', count(*) from leetcode_stats
union all select 'activities', count(*) from activities
order by 1"

echo "::group::Counting rows (before)"
psql "$BACKUP_DATABASE_URL" -At -F ' ' -c "$counts_sql" | tee "$out/before.txt"
echo "::endgroup::"

echo "::group::Dumping"
# --no-owner/--no-privileges: the copy can be loaded by any login, which is what you want on the day you need it.
pg_dump --format=custom --no-owner --no-privileges --schema=public --file "$dump" "$BACKUP_DATABASE_URL"
ls -l "$dump"
pg_restore --list "$dump" > /dev/null
echo "::endgroup::"

echo "::group::Counting rows (after)"
psql "$BACKUP_DATABASE_URL" -At -F ' ' -c "$counts_sql" | tee "$out/after.txt"
echo "::endgroup::"

if [ -n "${RESTORE_CHECK_URL:-}" ]; then
  echo "::group::Restoring into a scratch database to prove it works"
  "$here/restore.sh" "$dump" "$RESTORE_CHECK_URL" --scratch
  psql "$RESTORE_CHECK_URL" -At -F ' ' -c "$counts_sql" | tee "$out/restored.txt"
  # Rows can be added or removed while the dump runs, so a table is allowed to land anywhere between the count before and the count after
  # (with a little room). Anything outside that means the copy is not the database.
  python3 - "$out/before.txt" "$out/after.txt" "$out/restored.txt" <<'PY'
import sys
def read(p): return {l.split()[0]: int(l.split()[1]) for l in open(p) if l.strip()}
before, after, restored = (read(p) for p in sys.argv[1:4])
bad = []
for table, was in before.items():
    lo, hi = min(was, after[table]), max(was, after[table])
    got = restored.get(table)
    if got is None or got < lo - 5 or got > hi + 5:
        bad.append(f"{table}: live {was}..{after[table]}, restored {got}")
if bad:
    print("RESTORE CHECK FAILED\n  " + "\n  ".join(bad)); sys.exit(1)
print("restore check passed: " + ", ".join(f"{t}={restored[t]}" for t in sorted(restored)))
PY
  echo "::endgroup::"
else
  echo "::warning::RESTORE_CHECK_URL is not set, so this backup was not test-restored."
fi

age -r "$AGE_PUBLIC_KEY" -o "$dump.age" "$dump"
ls -l "$dump.age"
echo "$dump" > "$out/latest.txt"
