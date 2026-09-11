MAGIC DRAGON PIN v0.9.67 — DELIVERY MODULE + SUNDAY UI CLEANUP

Focused release:
- Completing a fully valid Sunday Workflow now archives that Sunday cycle as complete.
- The next time Sunday Wizard is opened, completed weeks are skipped and the Wizard starts fresh at Import until a newer Sunday report is uploaded.
- An unfinished Sunday cycle remains active and resumes where the work is still required.
- Historical correction/revision actions can still deliberately reopen their exact Sunday date without making it the normal active weekly cycle.
- On narrow iPhones, Payment date and Method stack vertically to prevent overlap.
- Returning from the fullscreen Sunday Workflow forces a fresh shell geometry calculation and Dashboard scroll reset.

DEPLOYMENT
Replace all 7 files in the GitHub Pages repository root, commit, wait for deployment, then confirm v0.9.67 in the header.

TEST
1. Finish an in-progress Sunday cycle through Payment and tap Complete.
2. Confirm Dashboard returns cleanly below the header.
3. Tap Sunday Wizard again: it should open at Import with no completed week active.
4. If a newer Sunday report is imported, the Wizard should use that new date and compare it with the immediately prior Sunday.
5. On iPhone, select Paid and confirm Payment date and Method are stacked with no overlap.


v0.9.67
- Normal Sunday Wizard resumes only an explicitly active imported cycle.
- Completing a cycle clears the active job and returns the next Wizard opening to Step 1 Import.
- Older historical Sunday reports are never auto-resurrected as current work.
- Historical dates can still be opened deliberately from records/review paths.
