# Runbooks

Step by step instructions for the moments when something is wrong and nobody has time to think. Each one says when to use it, what you need
before you start, the exact steps, how to check it worked, and what not to do. Keep them current: after any change to how the site is run,
update the runbook it touches, and put the date in the line at the top.

| Situation                                                                | Runbook                                          |
| ------------------------------------------------------------------------ | ------------------------------------------------ |
| The site shows errors or is very slow and you think it is the database   | [database-down.md](database-down.md)             |
| Data was deleted or damaged and has to be brought back                   | [restore-database.md](restore-database.md)       |
| Neon is down or the project is gone and the site must run somewhere else | [failover-to-standby.md](failover-to-standby.md) |
| Proving the backups really work (do this every few months)               | [restore-drill.md](restore-drill.md)             |
| Redis (Upstash) is down or out of commands                               | [redis-down.md](redis-down.md)                   |

Where things live: the backup job and its encrypted dumps are in the separate private backup repository (`ops/backup-repo` here is its
template). Passwords and keys are in the club's password manager, never in this repository.
