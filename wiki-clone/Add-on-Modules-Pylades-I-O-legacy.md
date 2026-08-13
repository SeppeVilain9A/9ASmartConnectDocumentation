<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Pylades I/O (legacy)

Model `Pyladesinputoutputframework` is an earlier, file-centric I/O framework (prefix `PYLIO`).

It focuses on simpler folder-based import/export with file logging and basic transformation, later extended with Azure File share and Blob support. It has no queue, events or real-time connectors — Smart Connect core supersedes it for new work.

#### Release history

| Version | Change |
| --- | --- |
| **1.0.0.5** | Fixed Azure File share orchestrator batch hanging. |
| **1.0.0.4** | Added Azure File share and Blob storage. |
| **1.0.0.3** | Added cleanup jobs for logs and processed files. |
| **1.0.0.2** | Removed Public Sector dependency; duplicate-file handling; rename-on-export. |
| **1.0.0.1** | XML class extension fixes; added created date/time to the logging table. |
