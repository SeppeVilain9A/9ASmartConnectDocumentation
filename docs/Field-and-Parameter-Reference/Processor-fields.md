<!-- nav: Processor fields | id: ref-processor -->
# Processor — complete field reference

The processor form is the most *adaptive* form in Smart Connect: most of its fields appear, hide, enable or become mandatory depending on the **data handler**, the **connector type**, the **process type** and a handful of global parameters. This section lists every field, then maps out exactly what each driver changes on the form.

### All processor fields

| Field | Table field | What it does |
| --- | --- | --- |
| **Processor Id** | `ProcessId` | Unique identifier / primary key. Read-only once created. |
| **Description** | `Description` | Free-text name of the process. |
| **Data handler** | `HandlerId` | The `NANHandler…` class that shapes the data. Choosing it auto-sets Direction and rebuilds the Variables grid. The single most important choice on the form. |
| **Direction** | `ProcessDirection` | Inbound or Outbound. Read-only — derived from the handler. Drives file-list vs unique-filename visibility. |
| **Type** | `ProcessType` | Execution model: Event, Direct, Periodic, Periodic multiple or Periodic transfer. |
| **Connector Id** | `ConnecterId` | The connector used to get/send data. Mandatory except for inbound Events and successor processors. |
| **Connector Id (to)** | `ConnecterIdTo` | Secondary/destination connector — only for a Periodic transfer. |
| **Use queue** | `UseQueue` | Enqueue messages so failures can be retried. Auto-enabled by two-stage import. |
| **Active** | `IsActive` | Enable the processor once it is configured correctly. |
| **Enable telemetry** | `EnableTelemetry` | Track this processor in telemetry (Application Insights). Only shown when a telemetry handler is configured. |
| **Enable logging** | `EnableLogging` | Log every step (not just errors) — useful while testing. |
| **Use multithreading** | `UseMultithreading` | Run the process in parallel worker threads. Only shown when multithreading is enabled globally. |
| **Group** | `ProcessGroupId` | Assign to a processor group for coordinated scheduling. |
| **Order** | `ProcessOrder` | Run sequence within a group/batch (e.g. headers before lines). |
| **Run separately** | `RunSeparately` | Exclude from the primary batch so it can be scheduled on its own. |
| **Use file list** | `FileList` | Fetch a list of files first, then process each separately (per-file error handling). Inbound only; auto-set from the connector. |
| **Unique filename** | `FilenameUnique` | Add a unique suffix to each outbound file. Shown for outbound DMF / Peppol Data / ER handlers. |
| **Replace file on upload** | `ReplaceFileOnUpload` | Overwrite an existing target file instead of erroring. Enabled only when the connector supports it (outbound). |
| **Maximum retries** | `RetryMax` | How many times a failed message is retried before it is abandoned. |
| **Wait before retry** | `RetryWaitTime` | Delay before the next retry attempt. |
| **Worker responsible** | `WorkerResponsible` | Optional F&O worker responsible for monitoring the process. |
| **Is successor processor** | `IsSuccessorProcessor` | Marks this processor as callable as a success/error successor. Shown when successors are enabled globally. |
| **Success processor Id** | `SuccessProcessorId` | Processor to run after a successful completion. |
| **Error processor Id** | `ErrorProcessorId` | Processor to run after a failure. |
| **Detailed successor flow** | `DetailedSuccessorProcessorFlow` | Create a fresh queue record for the successor instead of passing the same one through. |
| **Overwrite Id of queue** | `OverwriteIdOfQueue` | Successor inherits the parent's queue Id (default Yes). |
| **Import two stage status** | `TwoStageStatus` | Two-stage DMF import (stage → process). Shown for DMF inbound handlers; auto-enables Use queue. |
| **Skip queue execution** | `SkipQueueExecution` | Run an event directly even though Use queue is on. Shown for Event + Use queue. |
| **Add queue Id to resource Url** | `AddQueueIdToResourceUrl` | Append the queue Id to API calls for external tracking. Shown for API connectors. |
| **Sort field / Sort order** | `FileShareSortField` / `FileShareSortOrder` | Order in which files are read from an Azure *file share* (Filename / Created / Last written; Asc/Desc). |
| **Transfer e-invoice type** | `TransferEInvoiceType` | E-invoice standard for a periodic transfer: Standard, E-invoice or MySupply archive. |
| **Business process** | `BusinessProcess` | Bind an event processor to a business event (e.g. Sales invoice create). Part of the Events group. |
| **All accounts** | `IsAllAccounts` | Apply the business event to all accounts rather than a configured subset. |
| **Invoice type selection** | `InvoiceTypeSelection` | Filter which invoice types trigger the event. Enabled for Event + Sales invoice create. |
| **Worker max threads / retries / wait / recover timeout** | `Worker*` | Multithreading tuning — see the multithreading driver below. |

### Form-changing parameters — what each toggle reveals

These are the fields the question *"why did new fields just appear?"* is about. Each **driver** below, when set, shows or enables additional controls. Fields gated by a *global* parameter (in [Parameters](Global-parameters.md)) do not appear at all until that parameter is switched on.

| Driver field (and state) | What appears / changes on the form | Gated by |
| --- | --- | --- |
| **Data handler** chosen | Direction is set automatically; the *Variables* grid is (re)built from the handler; DMF handlers reveal *Two-stage status*; DMF-no-header handlers reveal a *Header* tab; outbound API handlers reveal an *API body* tab. | — |
| **Direction = Inbound** | *Use file list* becomes visible; *Unique filename* hides; Connector may become optional (Events/successors). | — |
| **Direction = Outbound** | *Unique filename* becomes visible (DMF/PD/ER handlers); *Replace file on upload* can be enabled; Connector is mandatory. | — |
| **Type = Event** | The *Events* group (Business process, All accounts, Invoice type selection) and the processor *Events* button appear; with Use queue, *Skip queue execution* appears. | — |
| **Type = Periodic transfer** (Inbound) | *Connector Id (to)* and *Transfer e-invoice type* appear; the Data handler field is hidden (fixed internally). | — |
| **Use queue = Yes** | The *Queue* button is enabled; for events, *Skip queue execution* becomes available; retry fields apply. | — |
| **Connector Type = Azure file share** | The *Sort field* / *Sort order* group appears (file read order). | — |
| **Connector Type = API** | *Add queue Id to resource Url* becomes available. | — |
| **Business process = Sales invoice create** | *Invoice type selection* is enabled; turning it on enables the *invoice types* picker. | Type = Event |
| **Is successor processor = Yes** | The *Successor processes* group (Success/Error processor, Detailed flow, Overwrite Id of queue) is shown; Connector is no longer mandatory. | Enable successor processor |
| **Use multithreading = Yes** | The *Multithreading* group (Worker max threads, Worker retry max, Worker retry wait, Worker recover timeout) appears; the run uses `NANOrchestratorV2`. | Enable processor multithreading |
| **Import two stage status = Yes** | Automatically switches *Use queue* on (two-stage import needs the queue). | DMF inbound handler |
| **Enable telemetry** | Only visible when a telemetry processor handler is registered in the environment. | Telemetry handler present |

![Processor with Type = Event revealing the Events and Successor process groups](/.attachments/16_processor_event.png)

*Type = Event. The Events and Successor processes groups appear on the General tab (this environment has both successor processing and multithreading enabled, so their fields are visible too).*

1.  Choose the *Business process* (e.g. Sales invoice create)
2.  Turn on *Invoice type selection* to filter which invoice types trigger the event

#### Successor processors — the revealed fields

With *Enable successor processor* on (Parameters) and *Is successor processor* = Yes, the **Successor processes** group exposes: *Success processor Id*, *Error processor Id*, *Detailed successor flow* and *Overwrite Id of queue*. A success/error target must itself be marked *Is successor processor* and cannot be the processor itself (validated on save). Full mechanics: [Process chaining](../Technical-Reference/Process-chaining-successors.md).

#### Multithreading — the revealed fields

With *Enable processor multithreading* on (Parameters) and *Use multithreading* = Yes, a **Multithreading** group appears:

| Field | Controls |
| --- | --- |
| **Worker max threads** | Maximum number of parallel worker threads the dispatcher may start. |
| **Worker retry max** | Maximum retries per work item before it is marked Failed. |
| **Worker retry wait time** | Delay before a failed work item is retried. |
| **Worker recover timeout time** | How long an item may stay *In processing* before it is treated as stale and recovered. |

Full mechanics — dispatcher, work items, pessimistic claim: [Multithreading & work dispatch](../Technical-Reference/Multithreading-and-work-dispatch.md).

![Processor with Use multithreading = Yes revealing the worker tuning fields](/.attachments/17_processor_multithreading.png)

*Use multithreading = Yes. The Multithreading group appears with the worker tuning fields.*

1.  *Worker maximum threads* — how many run in parallel
2.  *Worker maximum retries* — attempts per work item
3.  *Worker recover timeout* — when a stalled item is reclaimed (retry wait sits between)

### Processor sub-grids & buttons

| Element | Where | Purpose |
| --- | --- | --- |
| **Variables** grid | Variables tab | Handler/connector settings you must supply (e.g. Directory, Definition group). Rebuilt when the handler or connector changes; a *Reload* button regenerates it. |
| **Events** button | Action pane | The document events subscribed to this processor. Shown for Event processors. |
| **Invoice types** picker | Events group | Which invoice types trigger the event. Enabled for Event + Sales invoice create + Invoice type selection. |
| **Queue** button | Action pane | The queue records for this processor. Enabled when Use queue is on. |
| **Queue forms** | General tab | The F&O forms/tables allowed to enqueue to this processor. |
| **Log** button | Action pane | The execution log/history for this processor. |
| **Header** / **API body** tab | Detail tabs | A free-text template — Header appears for DMF-no-header inbound handlers; API body for outbound API handlers. |

> **Info: When does an Event processor actually fire — and for which accounts?**
>
> The *Events* group here only *declares* the business process. For the full picture — every out-of-the-box trigger, the difference between *All accounts* and the *Business process config* table, and how invoice-type filtering works — see [Events & triggers — when a document fires](Events-and-triggers.md).
