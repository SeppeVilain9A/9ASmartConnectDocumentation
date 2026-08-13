<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Data Management Framework

Smart Connect is designed to leverage the standard F&O **Data Management Framework (DMF)**. Any DMF definition group — for any standard or custom data entity — can be driven by a processor, in or out.

### Example: export customer email addresses to Azure file storage

1.  **Connector** — create a connector configured for *Azure file share*, authenticated with a connection string.
2.  **Processor** — create a processor using the `NANHandlerOutDmf` data handler and the connector from step 1. It exports through your DMF export project and sends the result to Azure file storage.
3.  **Variables** — on save, two variables are created automatically:
    -   *Definition group* — pick your DMF export project from the lookup.
    -   *Directory* — the Azure file-share folder for the export file. If left blank, the file lands in the root directory.
4.  **Run** — from *Periodic tasks > Run processors*, select the processor. The export runs as defined in the DMF project and the result is delivered to the specified location.

> **Info: Multiple entities in one definition group**
>
> When exporting via DMF with several entities in a definition group, set the sequence explicitly and start from **1**.
