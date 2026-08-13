<!-- nav: Processors | id: processors -->
# Processors

A **Processor** defines the specific process that must run — for example “send Electronic Reporting documents to an external API” or “import sales orders from Azure Storage through DMF”.

The processor ties together the *data handler* (what shape the data takes), the *connector* (how it is transported) and the *trigger* (when it runs).

### Processor fields

| Field | Meaning |
| --- | --- |
| **Processor Id** | The unique identifier for the processor. |
| **Data handler** | The class that determines how the data is handled. Its name shows the direction, e.g. `NANHandlerOutER` = outbound Electronic Reporting. |
| **Connector Id** | The connector the processor uses to get or send data. |
| **Use queue** | Enqueue messages so that, on failure, the process can simply be retried. |
| **Active** | Enable once the process is set up correctly and ready to run. |
| **Enable telemetry** | Keep telemetric data for this processor (Application Insights). |
| **Type** | How the process is triggered — derived from the data handler (see below). Change only together with a developer. |
| **Direction** | Inbound or outbound; the example handler dictates this. |
| **Group** / **Order** | Assign the processor to a group and define the run order (e.g. headers before lines). |
| **Unique filename** | Assign a unique name to each file sent to Azure storage, avoiding duplicate-file errors. |
| **Maximum retries** | The retry limit for a message before it is no longer processed. |
| **Queue forms** | A list of F&O tables (e.g. `SalesTable`) that may enqueue to this processor. |
| **Worker responsible** | Optionally define an F&O worker as responsible. |
| **9A Smart Connect – business process** | The predefined business process this processor serves. |
| **Run separately** | Exclude from the primary batch so it can be scheduled on its own. |
| **Use file list** | First fetch a list (e.g. from Azure storage), then process each file separately for proper per-file error handling. |
| **Variables** | Handler-defined settings that appear after you choose the data handler; you supply their values (e.g. *Directory*). |

> **Info: Every field, and why fields appear**
>
> This is the everyday view. For an exhaustive list of *every* processor field and a map of exactly which fields each toggle reveals (successors, multithreading, events, file share sort…), see [Processor — complete field reference](../Field-and-Parameter-Reference/Processor-fields.md).

### Processor types (triggers)

#### Direct — synchronous

Runs immediately when a specific process is triggered (typically outbound, e.g. a print destination).

#### Periodic — scheduled

Exports/imports data on a batch schedule or when a user runs it.

#### Periodic Multiple — related files

For imports where files relate to each other, e.g. an XML with a dependent PDF.

#### Periodic transfer — move files

Scheduled file transfer between locations.

#### Event — asynchronous

Creates events (e.g. from custom code) that are processed later in batch.

> **Info: Type and Direction follow the handler**
>
> Both are dictated by the selected data handler and normally cannot be changed by hand. Choosing the right handler is therefore the key decision when creating a processor.

### Create a processor — step by step

1.  **Open** *Definitions > Processor definitions* and select **New**.
2.  **Enter** a *Processor Id* and *Description*.
3.  **Select the Data handler.** Type and Direction fill in automatically, and the *Variables* grid appears.
4.  **Select the Connector Id** the processor should use.
5.  **Fill in the Variables** (e.g. *Directory*, *Definition group*, *Table*) — these are required by the handler.
6.  **Set behaviour** — *Use queue*, *Enable telemetry*, *Unique filename*, *Maximum retries*, group/order.
7.  **Set Active = Yes** and **Save**. Run it now from [Run processors](Periodic-tasks.md) or wait for its trigger.

![Processor definitions list in D365 F&O](/.attachments/06_processors_list.png)

*Processor definitions. The highlighted New button (1) adds a processor. The rich list on the left shows existing processors and their data handlers.*

![Create a processor — numbered fields](/.attachments/07_processor_new.png)

*Create a processor. Pick the Data handler first — Type, Direction and the Variables grid fill in automatically from it.*

1.  Enter a unique *Processor Id*
2.  Select the *Data handler*
3.  Enter a *Description*
4.  Select the *Connector Id*
5.  Enable *Use queue* for reliable retries
6.  Set *Active = Yes* when ready, then Save
