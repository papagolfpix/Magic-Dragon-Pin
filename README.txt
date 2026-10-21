MAGIC DRAGON PIN — v0.10.135 DEPLOY
18 October 2026

GUIDED SUNDAY MAPPING
- Fix Product Mapping opens the existing editable mapping form directly over
  the Sunday wizard. No Settings detour or spreadsheet re-import is needed.
- Only the current Sunday's unresolved names are displayed, with the clicked
  product first. Previously deferred names can be reviewed from this panel.
- Merge / Keep separate / Check Later retain their existing business behavior.
  Check Later does not bypass reconciliation. Keep separate creates a product;
  its catalogue type/prices still need checking before billing.
- Back to reconciliation remains visible and refreshes the current wizard step.
- Reuses the canonical full-screen overlay and existing mapping component.

BACKUP AND RECOVERY FIX (retained from v0.10.134)
- End-of-Sunday Save / Share now exports the complete, directly restorable
  format: all app records plus every available archived source spreadsheet.
- Complete Backup with Note uses the same format as Export Complete App Data.
- Downloaded Quick Safety Snapshot files now include archived spreadsheets.
  The browser-local quick rollback remains database-only, labelled explicitly.
- Import Complete App Data accepts older SUPPORT and BASELINE files directly.
  Those database-only imports keep existing archived spreadsheets on the device.
- Recovery files previously converted from SUPPORT also preserve device archives.
- Archive read failures stop the export instead of silently omitting files.
- Preview and backup status warn about original spreadsheets already missing.
- Import checks record contents and spreadsheet bytes, in addition to counts.
- Pre-import safety backup and confirmation remain required; failed writes
  attempt rollback to that saved state.

INSTALL
Deploy this package to the existing Magic Dragon production repository using
its existing deployment process. The ZIP contains the app files at its root.
Do not upload it to the TEST repository's TEST-only ZIP extraction workflow.
Keep the latest recovery/complete backup outside Safari before updating.
Reload and confirm v0.10.135 DEPLOY. Do not clear browser/site storage.
Create a Complete Backup, save it to Files, and select it with Import Complete
App Data to inspect the preview. Cancel the preview after checking counts.

VALIDATION
14 mapping DOM/control checks passed, including scoped names, focused variant,
alias save, deferred review, and return to the wizard without duplicate forms.
18 automated backup JavaScript checks passed using simulated IndexedDB, including
the actual Sunday export and restore handlers, original workbook-byte recovery,
legacy import, cancelled share retry, archive read failure and write rollback.
Application inline scripts and service worker passed syntax checks.
Visible version, exported appVersion and service-worker cache are v0.10.135.
Package integrity checked. Native iPhone Safari save/share has NOT been tested
in this environment; a final device check is required.

LIMITS
Exports include attachments that actually exist in this browser's archive.
Lost originals cannot be recreated from SUPPORT data. Missing originals are
reported; saved report records remain included. Save the JSON outside Safari.
This is a local-storage backup repair, not the future cloud database release.
No business records or user backups are bundled in this deployment ZIP.
