<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Data entities

All **10 OData / DMF data entities** in the current release are in the core model. The DMS, EB and PIW add-on models do not expose additional entities.

| Entity class | Label | Primary table | Purpose |
| --- | --- | --- | --- |
| `NANConnecterEntity` | Connectors | `NANConnecterTable` | Full connector master (type, URL, auth type, client ID/secret, tenant). Enables DMF import of multi-connector setups. |
| `NANProcessorEntity` | Processors | `NANProcessorTable` | Core processor definitions (handler, connector, type, direction, group, active). Primary DMF target for configuration migration. |
| `NANProcessorVariableEntity` | Processor variables | `NANProcessorVariableTable` | Variable name/value pairs per processor. Enables bulk import of all processor runtime parameters. |
| `NANProcessGroupEntity` | Process groups | `NANProcessGroupTable` | Processor group master (name, description). |
| `NANQueueEntity` | Queue | `NANQueueTable` | Full message queue (id, processor, status, payload, retry count, process step, filename). Enables external monitoring and bulk retry operations. |
| `NANQueueFormEntity` | Queue forms | `NANQueueFormTable` | Maps processors to D365 forms that can enqueue messages for that processor. |
| `NANPlaceholderTableEntity` | Placeholders | `NANPlaceholderTable` | Placeholder master for filename patterns and data substitution rules. |
| `NANPlaceholderLineEntity` | Placeholder lines | `NANPlaceholderLine` | Placeholder variable mappings: token → table/field reference + regex. |
| `NANBusinessProcessConfigEntity` | Business process | `NANBusinessProcessConfig` | Maps business processes (by relation type + account/group) to processors for event-driven routing. |
| `NANAttributeTableEntity` | Attributes | `NANAttributeTable` | Generic key-value attribute store per connector/processor combination; extensibility point for custom properties. |

> **Info: Using data entities**
>
> All 10 entities are available via OData (`/data/<EntityName>`) and the Data Management workspace. Use them to migrate connector/processor configurations between environments via a DMF definition group.
