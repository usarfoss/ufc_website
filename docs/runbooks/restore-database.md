# Bring the data back

_Last checked: not yet. Fix anything that was wrong when you follow it, and put the date here._

Use this when rows or tables were deleted or damaged (a bad migration, a wrong command, a bug that wiped things), or the Neon project is gone.

**Stop first.** Do not run anything on the production database until you have decided which way to restore. Every extra write makes it
harder to know what the right state was. If the damage is still happening (a job or a bug is deleting things), pause the QStash
schedules in the Upstash console first.

## Choose

| What happened                                                                                       | Use                        |
| --------------------------------------------------------------------------------------------------- | -------------------------- |
| Something was changed or deleted in the last few hours or days and the Neon project is fine         | **A. Neon history**        |
| The project, the database or the account is gone, or the damage is older than Neon's history window | **B. An encrypted backup** |

## A. Neon history (the fastest, and keeps everything up to the moment of the mistake)

1. In the Neon console open the project, then **Branches**. Create a new branch from the production branch, choosing a **point in the past**
   (the console calls this restoring or creating from past data). Pick a time just **before** the mistake.
2. That branch has its own address. Run `npm run db:ping -- "<that branch's direct address>"` and look at the row counts. Do they look right?
   If not, try an earlier time on another new branch.
3. Decide how to get the data back:
   - **Whole database is wrong:** in Neon, restore the production branch to that point (it keeps a backup of what it had), or point
     `DATABASE_URL` and `DIRECT_URL` in Vercel at the new branch and redeploy.
   - **Only some rows or one table:** leave production as it is and copy just the missing rows across. Export them from the branch
     (`\copy (select …) to 'rows.csv' csv` in psql), load that file into a scratch table in production, and insert from it with
     `insert … on conflict do nothing`, so nothing that is already there is overwritten. Do it with a second person watching, and run the
     select first to see how many rows you are about to add.
4. Check the site: sign in, open the members list and one event.

## B. An encrypted backup

You need: the private key (`ufc-backup-key.txt`, from the password manager), the `age` and `pg_restore` programs, and a place to restore
**to**. If Neon is fine, restore into a **new branch or a new empty database, never over production** in the first attempt.

1. Download a backup: in the backup repository, **Actions**, open the latest green "Database backup" run and download the artifact, or take a
   weekly one from **Releases**. Unzip it. The file ends in `.dump.age`.
2. Open it:
   ```bash
   age -d -i ufc-backup-key.txt -o ufc.dump ufc-20261010T0617Z.dump.age
   ```
3. Create an empty target (a Neon branch, or a new project), and load the backup into it:
   ```bash
   ./scripts/restore.sh ufc.dump "postgresql://…direct address of the target…"
   ```
   (`restore.sh` is in the backup repository. It will ask you to type the host name, on purpose.)
4. Check it: `npm run db:ping -- "<target address>"`. The row counts should be close to what you expect, and the newest member and event
   should be recent. The backup is at most 6 hours old.
5. Make it the real database: in Vercel set `DATABASE_URL` (the pooled address of the target) and `DIRECT_URL` (the direct one), then
   redeploy. Run `ops/sql/roles.sql` on the target first, so the site runs with the restricted login.
6. Check the site. Anything that happened after the backup is lost: ask members who signed up or events that were created in that window
   to do it again.

## After

- Write down what happened, what you restored from, and how much was lost. A few lines in the club's notes is enough.
- Work out how the mistake was possible and close that door (a restricted login, a guard, a check) before the next one.
- Members' GitHub connections are stored encrypted with `TOKEN_ENCRYPTION_KEY`. It is **not** in the database, so keep it in the password
  manager. A restored copy is unreadable without it, and members would have to sign in again.
