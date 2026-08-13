<!-- nav: Sub-tables | id: ref-subtables -->
# Sub-tables & supporting data

The smaller tables that hang off connectors and processors. Most are edited through grids on the connector/processor forms rather than standalone menu items.

### Processor variables & exclusions

| Table / field | Purpose |
| --- | --- |
| **Processor variables** `NANProcessorVariableTable` | Key/value settings the handler and connector require. *Variable name* and *Connector to* are read-only (defined by the interface); you fill in *Value*. *Inactive* variables are hidden by filename-based selection. |
| **Exclude variables** `NANProcessorExcludeVariableTable` | Per-connector list of variables that should not be exposed to users; drives the *Inactive* flag on processor variables. |

### Events, invoice types & business process

| Table / field | Purpose |
| --- | --- |
| **Processor events** `NANProcessorEventTable` | One row per document event (Insert/Update/Delete) captured for a processor: source table + record, Status (Waiting/Sent/Error), retry count and message. Linked to a queue message. |
| **Invoice types** `NANProcessorInvoiceTypeTable` | Which invoice types trigger the processor: Sales invoice/credit note, Free text invoice/credit note, Project invoice/credit note. |
| **Business process config** `NANBusinessProcessConfig` | Maps a processor to a customer/vendor account or account group, so different partners can use different processes. |

### Attributes, placeholders & groups

| Table / field | Purpose |
| --- | --- |
| **Attributes** `NANAttributeTable` | Generic name/value metadata for a connector and (optionally) a processor. Lookups fall back from the specific processor to a connector-wide default. |
| **Placeholder** `NANPlaceholderTable` + **lines** `NANPlaceholderLine` | Reusable regex patterns that extract values from an inbound payload into queue fields (each line = a regex → a target field). |
| **Process group** `NANProcessGroupTable` | Named group of processors scheduled together (referenced by *Group* on the processor). |

### Processor log

Every run writes to `NANProcessorLogTable`: the processor, log level (Info/Error), the message, the source table+record, the queue message Id, the DMF execution Id, the handler class and the filename/reference. It is the primary audit trail and the backing data for the [Logs](../Functional-Guide/Queue-events-and-logs.md) inquiry.
