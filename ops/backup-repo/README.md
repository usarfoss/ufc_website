# UFC database backups

This repository holds nothing but the job that backs up the UFC website's database. It is meant to live in its own **private** repository,
owned by a different person than the website's repository, so that one account problem cannot take both the database and its backups.

Every 6 hours a GitHub Action:

1. dumps the database (read-only login),
2. loads the dump into a throwaway Postgres and compares row counts, so a backup that cannot be restored fails loudly,
3. encrypts it to a public key (only the private key, which is not on GitHub, can open it),
4. keeps it as an artifact for 30 days, and one a week as a release (the newest 12),
5. refreshes up to two standby databases from it.

## Set it up

Copy everything in this folder (including `.github/`) into a new private repository, then add these under
**Settings, Secrets and variables, Actions**:

| Name                  | Kind               | What                                                                                                                   |
| --------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `BACKUP_DATABASE_URL` | secret             | Neon **direct** address (no `-pooler`) with the `ufc_backup` login. See `ops/sql/roles.sql` in the website repository. |
| `AGE_PUBLIC_KEY`      | secret             | The public key, starting `age1`. Make the pair on your own machine: `age-keygen -o ufc-backup-key.txt`                 |
| `STANDBY_1_URL`       | secret, optional   | Direct address of a second Postgres (another Neon account, Supabase, ...) that is kept as a copy.                      |
| `STANDBY_2_URL`       | secret, optional   | The same, for a third.                                                                                                 |
| `PG_MAJOR`            | variable, optional | Postgres major version of the database, if it is not 17.                                                               |

Then **Actions, Database backup, Run workflow** once, and check it goes green. The first successful run produces an artifact; open it to
make sure there is a `.dump.age` file in it.

## The private key

`ufc-backup-key.txt` is the only thing that can open the backups.

- Keep it in a password manager that **two** officers can reach, and print one copy for the club's records.
- It must **never** be in this repository, in the website's repository, or in a GitHub secret.
- If it is lost, every backup is useless. If it leaks, make a new pair, change `AGE_PUBLIC_KEY`, and treat the old backups as exposed.

## Restoring

See `docs/runbooks/restore-database.md` in the website repository. In short:

```bash
age -d -i ufc-backup-key.txt -o ufc.dump ufc-20261010T0617Z.dump.age
./scripts/restore.sh ufc.dump "postgresql://…direct address of the empty target…"
```

## Practise it

Do a restore into a scratch database every few months (`docs/runbooks/restore-drill.md`). The automatic check proves the file is good; only
the drill proves **you** can open it with the key you actually have.
