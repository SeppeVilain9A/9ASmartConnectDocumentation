<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Worked example: sales invoice to Azure File share

This end-to-end example sends a posted sales invoice PDF to Azure storage.

#### 1 · Connector

Create a connector of type **Azure File Share**, authenticated with a *connection string*.

**Connector — INV-AZURE**

| Field | Value |
| --- | --- |
| Connector Id | INV-AZURE |
| Type | Azure file share |
| Azure storage authentication | Connection string |
| Storage name | mycompanystorage |

#### 2 · Processor

Create a processor using the built-in **SSRS Print Destination** data handler and the connector above. Set it to *Active*. Type and Direction are dictated by the handler and cannot be changed manually.

**Processor — SI-EXPORT**

| Field | Value |
| --- | --- |
| Processor Id | SI-EXPORT |
| Data handler | Print destination (SSRS) |
| Connector Id | INV-AZURE |
| Direction | Outbound |
| Active | Yes |

#### 3 · Variables

Complete the handler's predefined variables — these are used during execution:

| Variable | Example | Purpose |
| --- | --- | --- |
| **Directory** | `Sales Invoices` | Target folder in Azure file storage. |
| **Prefix** | `INV` | Text prepended to the file name for easy identification. |
| **Postfix** | `INV` | Text appended to the file name. |
| **Table** | `CustInvoiceJour` | The underlying table the SSRS report is based on (must be specified for external printing). |

Now, whenever a customer invoice is posted and printed to the *9A Smart Connect* destination, the PDF is delivered to the `Sales Invoices` folder in Azure.
