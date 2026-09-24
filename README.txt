MAGIC DRAGON PIN — v0.10.131 DEPLOY

Production promotion of the user-verified v0.10.130 TEST build.

Validated before promotion:
- Saturday 19 Sep Lamai + Sunday 20 Sep Bangrak are grouped into one 20 Sep billing cycle.
- Both shop reports reconcile and both financial contributions are included.
- Spreadsheet financial-integrity mismatch is detected when workbook totals omit product rows.
- Lamai's workbook Pay Pin value 619.5 can be reviewed against the full imported-line calculation 1009.5.
- The stale 23-Aug Lamai -87 test carry-forward is cleaned from restored data.
- Financial mismatch review uses the saved report / resolution flow rather than the iPhone file picker.
- Existing v0.10.124 regression protections remain part of the baseline.

Production sanitation:
- Visible build label: v0.10.131 DEPLOY.
- Production-specific service-worker cache.
- Reachable TEST-only suggested-docket creation control removed.
- TEST-only backup-prompt control removed.
- DEV/Test cloud panel remains hidden and is not part of Pin's normal workflow.

Deployment notes:
- Do not reset Pin's local data.
- Keep the latest Complete App Data backup as the rollback snapshot.
- This build does not alter the current invoice's paid/unpaid status automatically.
