<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Azure storage guide

Choosing the right Azure storage type is important; the proper implementation depends on how the files are used.

| Type | Best for | Folder structure | Typical use |
| --- | --- | --- | --- |
| **File share** | Everyday file handling and manual up/download | Multi-level folders | Users interacting with files; attach to external processes. Most popular option. |
| **Container** | High volume of small/medium files processed automatically | Single folder depth | Service processes; the only supported option when using a Logic App for FTPS. |
| **Blob** | Large files needed infrequently | No folder structure | e.g. a complete stock file generated every morning at 00:30. |

### File / DMF file formats

With DMF you can choose the format — XML element, XML attribute, CSV, Excel, and so on. Experience suggests:

-   **CSV** — excellent for quick, straightforward import/export of large volumes. Avoid it when users will open the file, because regional settings in Excel can alter the data.
-   **XML** — preferred when user interaction is involved; it is more robust.
