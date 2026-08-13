<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Inbound pipeline

The inbound (import) flow retrieves data from an external source and processes it into D365 F&O. For file-based connectors it can first list files and then process each one individually for per-file error handling.

```mermaid
sequenceDiagram
    autonumber
    participant S as Scheduler / Event
    participant O as NANOrchestratorV2
    participant P as NANProcessorIn
    participant C as NANConnecter
    participant X as External source
    participant H as NANHandlerIn
    participant D as D365 (DMF / tables)
    S->>O: process(NANContract)
    O->>P: process() then processIn()
    P->>C: getFileNames() (if file list)
    C->>X: list files
    X-->>C: file names
    loop each file
        P->>C: execute(Get, reference)
        C->>X: download
        X-->>C: payload
        C-->>P: payload
        P->>H: processPayload() then data.process()
        H->>D: import (DMF / custom)
        alt success
            P->>C: moveDelete -> success folder
        else failure
            P->>C: moveDelete -> failure folder
        end
    end
```

*Figure 4 — Inbound sequence. Files can move to success/failure folders before or after processing (two-stage status).*

> **Info: File-list processing**
>
> With *Use file list*, the framework first obtains the list of files, then processes each file name separately. One bad file no longer blocks the rest of the batch.
