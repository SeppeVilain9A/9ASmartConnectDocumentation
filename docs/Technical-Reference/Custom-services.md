<!-- nav: Custom services | id: custom-services -->
# Custom services

Smart Connect ships **one custom web service** that lets an external system talk to the framework directly over D365's standard OData/JSON service endpoints — without a scheduled connector poll. It is the counterpart to the outbound [connectors](../functional-guide/connectors.md): where connectors *reach out*, this service lets the outside world *push in* and *report back*.

| Object | Type | Purpose |
| --- | --- | --- |
| `NANProcessServiceGroup` | Service group (`AutoDeploy = Yes`) | Publishes the service so it is reachable at `/api/services/…`. |
| `NANProcessInService` | Service (`ExternalName = NANProcessInService`) | Inbound process service exposing two operations. |

Because the group auto-deploys, both operations are callable as POST requests:

-   `POST /api/services/NANProcessServiceGroup/NANProcessInService/setQueue`
-   `POST /api/services/NANProcessServiceGroup/NANProcessInService/setQueueResponse`

> **Info: Authentication**
>
> The endpoints use standard D365 F&O service authentication (Azure AD OAuth bearer token for the calling app registration). No Smart Connect-specific credential is involved on the inbound side.

## `setQueue` — push a message into the queue

An external middleware calls `setQueue` to drop a payload straight onto the Smart Connect [queue](../functional-guide/queue-events-and-logs.md), exactly as an inbound connector would. Internally it runs `NANQueueTable::enqueue(...)` inside the requested company. This is the endpoint the Peppol middleware uses (see [E-invoicing — Belgium](../e-invoicing-and-edi/belgium-peppol.md)).

**Contract:** `NANProcessInContract` (`[DataContract('ProcessRequest')]`)

| Data member | Type | Purpose |
| --- | --- | --- |
| `ProcessId` | NANProcessorId | Target processor that will handle the message. |
| `Direction` | NANProcessDirection | `Inbound` / `Outbound`. |
| `Company` / `DataAreaId` | SelectableDataArea | Legal entity to enqueue in; defaults to the calling context company. |
| `Payload` | String | The message body (UTF-8). |
| `Filename` / `FileType` | Filename / FilenameType | Filename and extension recorded on the queue message. |
| `ProcessRunId` / `Id` | Guid | Correlation identifiers for the run and the individual message. |
| `RefId` | String | Optional external reference stored on the queue record. |
| `Image` / `ImageFileName` | String / Filename | Optional embedded image (e.g. a rendered document) and its filename. |

**Flow:** `External system` → `POST …/setQueue` → `NANQueueTable::enqueue()` → `Queue` → processor

## `setQueueResponse` — the deferred response

This is the **deferred (asynchronous) response** operation. When a message is sent outbound and the receiving party only confirms the result *later*, that party (or the middleware) calls `setQueueResponse` with the original `QueueId` and the outcome. Smart Connect validates the queue still exists and the result type is known, then writes a **deferred** response onto `NANQueueResponseLogTable`.

**Contract:** `NANQueueResponseLogContract` (`[DataContract]`)

| Data member | Type | Purpose |
| --- | --- | --- |
| `QueueId` | Guid | The queue message the response belongs to (must exist). |
| `Company` | SelectableDataArea | Legal entity of the original message; defaults to the calling context company. |
| `Payload` | String | The raw response content to log. |
| `ResponseResult` | NANResponseResult (string) | Result of processing; parsed to `NANResponseResultType` — `Processed`, `Error` or `Warning`. An unknown value is rejected (`validate()`). |

The result is stored via `NANQueueResponseLogTable::createLog(NANResponseType::Deferred, …)`, which is what distinguishes it from a **direct** response captured synchronously when a connector's *Enable response log* is on (see [Queue and retry mechanics](queue-and-retry-mechanics.md)).

**Flow:** `Receiving party` → `POST …/setQueueResponse` → `validate QueueId + result type` → `NANQueueResponseLogTable (Deferred)`

### Direct vs deferred responses

| | Direct | Deferred |
| --- | --- | --- |
| Captured when | The connector call returns (synchronous), if *Enable response log* is set | Later, when the counterparty calls `setQueueResponse` |
| Written by | The outbound pipeline | `NANProcessInService.setQueueResponse` |
| Response type | `NANResponseType::Direct` | `NANResponseType::Deferred` |
| Result values | — | `NANResponseResultType`: Processed / Error / Warning |

Both are stored on `NANQueueResponseLogTable` and reviewable per message from the queue's **Direct/deferred responses** form; the queue row also exposes a **Deferred response** button once a deferred entry exists. See [Queue fields](../field-and-parameter-reference/queue-fields.md) and [Queue events and logs](../functional-guide/queue-events-and-logs.md).

> **Info: Extensible**
>
> `NANResponseType` and `NANResponseResultType` are both extensible enums — a customisation can add further response kinds or result types without changing the service contract.
