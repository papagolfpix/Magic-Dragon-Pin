MAGIC DRAGON PIN v0.6.1 — DATA INTEGRITY / CONFLICT CLEANUP

KEY CHANGES
- OCR fallback moved to the very bottom of Sunday Report Import and renamed:
  Screenshot OCR — Emergency Backup Only
- Homepage quick action renamed to Upload Sunday Report.
- Automatic data cleanup runs on startup and after Excel imports.
- Duplicate/superseded weekly records are removed automatically.
- If Excel and lower-quality OCR/manual data exist for the same branch/date, Excel is preferred.
- Only ONE active Sunday report per branch/date is kept.
- Re-importing the same branch/date now prompts:
  Replace existing active report / Cancel.
- Duplicate archive records for the same branch/date are cleaned automatically.
- Week-to-week reconciliation ONLY compares near-consecutive Sunday reports (5–9 day gap).
- Older reports separated by long gaps are treated as incomplete history, not stock errors.
- Product mapping improved by normalizing pre-roll/preroll, 1 g/1g, 5 g/5g, and apostrophe variations.
- Mapping warnings now include match score when available.
- Data Integrity panel reports automatic cleanup results.
- Existing Excel archive, master workbook export, and emergency OCR remain available.

STORAGE
Still local-device/browser storage for this phase. Shared cloud sync remains planned for a later major stage.
