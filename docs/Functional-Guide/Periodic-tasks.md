<!-- nav: Periodic tasks | id: periodic -->
# Periodic tasks

Periodic tasks are the batch-schedulable operations of Smart Connect.

### Run processors

The **Run processors** function executes processors — periodically in batch or manually on demand.

| Dialog field | Behaviour |
| --- | --- |
| **Processor group** | Run a specific group. Leave empty to run all processors that are *not* part of a group. |
| **Processor Id** | Run one specific processor. Leave empty to run all active processors. |

![Run processors dialog](/.attachments/09_run_processors.png)

*Run processors. Leave the fields empty to run every active processor, or select a specific group/processor. Schedule it in batch for recurring runs.*

### Clear / cleanup logs

Purges outdated logging data. The *Days* parameter removes logs older than the specified period. Schedule this in batch to prevent unnecessary storage costs and keep the log manageable.

### Cleanup queue

Removes queue items older than the number of days set in the *Older than* field. The cleanup status determines what is removed:

`All` `Processed / Cancelled` `Processed / Cancelled / Error`

### Electronic reporting process

Lets you select an Electronic Reporting configuration to be processed in batch.

> **Tip: Housekeeping matters**
>
> Always schedule the log and queue cleanup jobs. They keep the tables lean, which protects performance and controls storage cost.
