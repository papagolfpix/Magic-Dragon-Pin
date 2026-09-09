MAGIC DRAGON PIN v0.5.0 — EXCEL SUNDAY IMPORT

PRIMARY WORKFLOW
- Import one or multiple .xlsx/.xls Sunday reports at once.
- No branch selection required for Excel imports.
- App detects BM Bangrak / Lamai from workbook content or file name.
- App detects Check Date from the worksheet.
- Known BM template columns are read directly from spreadsheet cells.
- Spreadsheet arithmetic is self-checked during import.
- Imported report is archived under a chronological logical name:
  YYYY-MM-DD_BM-Bangrak_Sunday-Stock.xlsx
  YYYY-MM-DD_Lamai_Sunday-Stock.xlsx
- Original workbook is stored internally in IndexedDB where supported.
- Parsed report is stored in app data and creates/updates the matching weekly record.
- Duplicate branch/date imports replace the earlier version instead of creating duplicate weeks.
- Sunday Report Archive lists imported files chronologically.
- "Source file" can download the internally archived original using the generated chronological name.
- "Export Master Workbook" creates one consolidated Excel workbook containing:
  * Index sheet
  * One normalized worksheet for every imported Sunday report
- Screenshot multi-pass OCR remains as fallback.

TESTED FORMAT
Built specifically against the supplied example:
2026 BM stock control copy 1.xlsx
Worksheet: Cannabis
Known columns:
B Product
C Old stock
D New Deliver
E Take out
F Total
G Instock
H Sold
I Sell Price
J Cost
L Total Sales
M Total Cost
N Total Profit
O BM
P Alix
Q Pin

IMPORTANT
Excel reading/export uses SheetJS loaded on demand, so internet is required at import/export time in this build.
