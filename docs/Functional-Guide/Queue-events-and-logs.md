<!-- nav: Queue, events & logs | id: inquiries -->
# Queue, events & logs

These inquiry forms let you monitor, retry and troubleshoot everything Smart Connect does.

### Queue

The queue holds messages so they can be retried if a process fails — for example if an authentication key expired during an export, the messages remain available for retry.

-   **Process** — manually trigger a pending/failed message.
-   **Cancel** — cancel a message you no longer want sent.
-   **Log / Info / Data management** — inspect what happened to the message, including the direct and deferred responses where available.
-   **View content** — view the document contents held on the queue.

> **Warning: Queueable content**
>
> Only content that can be serialised to/from a string is supported on the queue — such as XML, JSON and CSV.

Queue statuses:

`Pending` `Processed` `Error` `Cancelled`

![9A Smart Connect Queue form](/.attachments/10_queue.png)

*The Queue. Every message and its status; select a row to Process (retry), Cancel, or inspect the log, info and content.*

### Events

Events create a record for later processing (asynchronous). When the batch job runs, events are processed and information is sent to the target system. An event does not contain the payload itself — it simply records what action must be taken. Use the *Send event* button to test.

### Logs

All errors are logged automatically and can be queried here. If information logging is enabled in [Parameters](setup-and-parameters.md) (or on the processor), information messages appear here too.

![9A Smart Connect Logs form](/.attachments/11_logs.png)

*The Logs form. Processor execution history — errors are always recorded; information messages appear when logging is enabled.*
