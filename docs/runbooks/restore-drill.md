# Prove the backups work (every few months)

_Last done: never. Put the date and who did it here after each time._

A backup you have never restored is a guess. The automatic job proves the file loads into a clean Postgres. This drill proves **you** can
get from the key in the password manager to a working copy of the site, which is the part that goes wrong in a real emergency.

Takes about 30 minutes. Do it with a second officer so two people know how.

## Steps

1. **Get a backup.** Backup repository, Actions, latest green run, download the artifact. (Do the same with a weekly release once, to check
   those work too.)
2. **Get the key.** From the password manager, to a file `ufc-backup-key.txt` on your machine. Note anything that was hard to find or
   unclear.
3. **Open it.**
   ```bash
   age -d -i ufc-backup-key.txt -o ufc.dump ufc-<time>.dump.age
   ```
4. **Make a scratch database.** A new Neon branch of the **development** branch, or any empty Postgres.
5. **Load it.**
   ```bash
   ./scripts/restore.sh ufc.dump "postgresql://…scratch direct address…"
   ```
6. **Look at it.** `npm run db:ping -- "<scratch address>"` and compare the row counts with the real database (`npm run db:ping`).
7. **Run the site on it.** In a local `.env`, set `DATABASE_URL` to the scratch database, run `npm run dev`, and look at the members list
   and an event page.
8. **Clean up.** Delete the scratch branch, `ufc.dump` and the key file from your machine.
9. **Write it down.** The date, who did it, how long it took, and anything that did not work. Fix the runbook if a step was wrong.

## Also check

- The standby: `npm run db:ping -- "<standby address>"`. Is it recent (look at the newest member)? If the refresh is failing you will
  have had emails; if nobody gets them, fix that.
- That two people can reach the key, and that the passwords in the password manager still work.
