MAGIC DRAGON PIN v0.9.71 — FULL BACKUP / RESTORE HARDENING

Focused release:
- Settings > Backup & local data now creates a complete portable backup.
- Backup contains the full app database plus archived Sunday source workbooks stored in IndexedDB.
- Backup file includes a format/schema marker, timestamp and record counts for validation.
- Restore validates the package before touching current data and shows exactly what will replace the device state.
- Restore replaces, rather than merges with, existing app data to avoid stale records surviving.
- Archived Sunday workbooks are restored to local file storage as part of the same operation.
- iPhone uses the Share sheet for the backup when supported, with a normal file-save fallback.
- No Sunday workflow, accounting or docket logic changed.

DEPLOYMENT
Replace all 7 files in the GitHub Pages repository root, commit, wait for deployment, then confirm v0.9.71 in the header.

TEST
1. Settings > Backup & local data > Create full backup.
2. Save/share the generated Magic-Dragon-Pin-Backup-YYYY-MM-DD.json file.
3. Preferably test Restore backup on a second browser/device before relying on it operationally.
4. Confirm restored deliveries, Sunday reports, invoices, payments, mappings and archived source workbooks are present.
