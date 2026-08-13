<!-- nav: Queue fields | id: ref-queue -->
# Queue — complete field reference

The *Queue* holds every message a processor enqueues. It is where retries, manual reprocessing and manual file uploads happen. This section covers every field, the status values, the form actions, and the linked tables.

### Queue fields

| Field | Table field | Meaning |
| --- | --- | --- |
| **Message Queue Id** | `QueueId` | Unique GUID of the message (auto-generated). Primary key. |
| **Processor Id** | `ProcessId` | The processor that owns the message. |
| **Status** | `Status` | Processing state — Pending, Processed, Error or Cancelled (see below). |
| **Direction** | `ProcessDirection` | Inbound (into F&O) or Outbound (out of F&O). |
| **Processed** | `ProcessDT` | Timestamp the message reached Processed. |
| **Payload** | `Payload` | The message content (the file/data being processed). |
| **File name / File type** | `Filename` / `FileType` | Original filename and extension of the source document. |
| **Id** | `Id` | The business record identifier (e.g. SalesId, invoice number). |
| **Retry count** | `RetryCount` | Number of retry attempts so far. Incremented on each Error. |
| **Retry date/time** | `RetryDateTime` | Earliest time the message may be retried (now + *Wait before retry*). |
| **Process run Id** | `ProcessRunId` | Id of the current run — stops a run picking up its own retries. |
| **Execution Id / Entity** | `ExecutionId` / `Entity` | Links to the DMF execution and entity for DMF-based processing. |
| **Image / Image file name** | `Image` / `ImageFileName` | An attached document (Base64) and its filename. |
| **Process step** | `ProcessStep` | Step indicator for multi-step processing. |
| **Processor worker status** | `ProcessorWorkerStatus` | Multithreading worker state — None, Queued, Retry waiting or Failed. Shown only when multithreading is enabled. |

### Queue status values

`Pending — enqueued, ready to process` `Processed — completed successfully` `Error — failed, eligible for retry` `Cancelled — excluded by the user`

### Queue form actions

| Button | What it does | Available when |
| --- | --- | --- |
| **Process message** | Manually (re)process the selected message(s). | Status is not Processed/Cancelled and no worker is busy on it. |
| **Cancel message** | Set the message to Cancelled so it is skipped. | Status is not Processed/Cancelled and no worker is busy. |
| **Upload** | Manually upload a file, creating a new *Pending* inbound queue record. | *Manually upload files* is on and the processor is Inbound. |
| **Upload secondary** | Attach a secondary payload (e.g. a PDF beside an XML) to an existing record. | *Manually upload files* is on, the connector supports it, and Inbound. |

> **Info: Manual upload → queue**
>
> The *Upload* buttons only appear after you switch on *Manually upload files* in [Parameters](Global-parameters.md). Uploading creates a queue record with Status = *Pending*, the file as the Payload and the filename set; the retry engine then picks it up like any other message — so a failed import can be retried without re-uploading.

### Linked queue tables

| Table | Holds |
| --- | --- |
| **Queue response log**
`NANQueueResponseLogTable` | Responses received for a message — *Direct* (synchronous) or *Deferred* (asynchronous), with a result of Processed / Error / Warning and the response content. |
| **Queue payload**
`NANQueuePayloadTable` | A secondary/alternate payload (binary) attached to a message — filename, file type and content. |
| **Queue forms**
`NANQueueFormTable` | Maps a processor to the F&O forms where its queue can be accessed/enqueued (per-form Enabled flag). |
