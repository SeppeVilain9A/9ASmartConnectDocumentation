<!-- nav: Filename handling | id: filenames -->
# Filename handling

Two related capabilities give you control over which inbound files are picked up, and how file names are sanitised and made unique.

### Filename-based selection

When `NANParameterTable.SearchOnFilenameBasedQuery` is enabled, inbound processing filters the file list before fetching. `NANProcessorIn.allowFetchFilename()` checks each candidate against the connector's search pattern (`searchFilenameStringInDirectory()`) and extension filter (`searchFileExtentionInDirectory()`).

| Pattern | Matches |
| --- | --- |
| `*invoice*` | files that contain “invoice” anywhere in the name. |
| `PO_*` | files whose name starts with “PO\_”. |
| `*.xml` / `*_out` | files whose name ends with the given text. |
| `*` | all files (no filtering). |

An extension filter (e.g. `.xml`, `.csv`) is compared case-insensitively. A file must satisfy *both* the pattern and the extension (when both are set) to be processed; others are skipped silently.

### Filename cleaning

`NANFunctions::cleanFilename()` replaces characters that are illegal in file systems — `\ / : * ? " < > |` — with an underscore. It is controlled by `NANParameterTable.DisableFilenameCleaning` and can be overridden per connector via `NANConnecterTable.DisableFilenameCleaning` (a three-state `NANDefaultNoYes`: *Default* inherits the global, *Yes* forces off, *No* forces on).

**Flow:** `Invoice:2024<Draft>.xml` → `cleanFilename()` → `Invoice_2024_Draft_.xml`

### Unique file names

When a processor's *Unique filename* option is on, `NANFunctions::getUniqueFilename()` appends a UTC timestamp to the base name (keeping the extension), so an existing file can be replaced without a duplicate-name collision.

**Flow:** `Report.xml` → `getUniqueFilename()` → `Report_01-15-2024 023045.1234 PM.xml`

> **Tip: When to use each**
>
> Use *filename-based selection* to share one inbound folder across several processes (each picking up only its own files). Use *unique filename* for outbound Azure storage to avoid duplicate-file errors.
