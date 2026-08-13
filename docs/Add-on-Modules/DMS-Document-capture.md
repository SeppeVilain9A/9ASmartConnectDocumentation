<!-- nav: DMS — Document capture | id: dms -->
# DMS — Document capture

Model `InputOutputFrameworkV2 DMS` adds inbound document capture and management on top of the core, bridging D365 F&O to the **9A Raptor Document Warehouse (DWH)**.

It handles structured invoice / purchase-order import — UBL e-invoices, Tungsten and MySupply — and archives every document to Raptor so it stays traceable from both the Smart Connect queue and the Raptor *All invoices* record.

[Raptor Document Warehouse — docs — docs.raptor.9altitudes.com/9a-document-management](/.attachments/9a-document-management)

> **Warning: Raptor is a separate product**
>
> Raptor's source is *not* part of this codebase — only its binaries ship with the DMS model (`ExarteRaptorCore`, `ExarteRaptorDocumentManagement`, `ExarteRaptorInputManagement`). For Raptor setup and concepts, use the [Raptor Document Warehouse documentation](https://docs.raptor.9altitudes.com/9a-document-management). This manual covers only how Smart Connect *integrates* with it.

### How Smart Connect integrates with Raptor

| Concern | Smart Connect object |
| --- | --- |
| Archive an XML / PDF / attachment to the DWH | `NANExaUtils::uploadToDocWarehouse(Stream)`, `EXADocuHelper` |
| Create the imported purchase invoice | `EXAPurchInvoiceImportedEntity` (the *All invoices* record) |
| Link documents to the invoice with tags | `EXADocuHelper::addTagsFromToDocuments()` + processor template |
| Match a document to a purchase order | `NANExaPurchRegexTable` (regex PO transformation) |
| Connector / retrieval settings | `NANExaConnectorRaptorTable`, `NANExaPurchFormatTable` |
| Per-message state across steps | `NANQueueHandlerInDMSUblTable` |

The archive-first pattern (see [E-invoicing — Belgium](../E-Invoicing-and-EDI/Belgium-Peppol.md)) links each archived document to the Smart Connect queue record by its unique id, and — after the invoice is created — tags them with the context of the Raptor *All invoices* record based on a template configured on the processor.

#### What it contributes

`UBL import (V1 / V2 / RO)``Tungsten import``MySupply import``Raptor archiving``PO regex matching``UBL / project-invoice export`

### Raptor setup on the processor

When a processor uses a **9A Raptor DWH** connector, the processor form gains a **9A Raptor DWH** tab and a **Raptor connector setup** button (next to the *Regex* button used for [PO recognition](../E-Invoicing-and-EDI/Purchase-order-recognition.md)).

![Processor with the 9A Raptor DWH tab and archive settings](/.attachments/23_processor_raptor_tab.png)

*The 9A Raptor DWH tab on a MySupply import processor. It controls what is archived to Raptor: (Archive email is added for the Tungsten flow, and a Document template sets the Raptor template.)*

1.  *Archive XML* — archive the source UBL/XML document
2.  *Archive attachments* — archive the embedded PDF / attachments

The **Raptor connector setup** button opens a mapping form that tells Raptor *which record* to attach each document to and *which template* to tag it with — evaluated top-down by *Sorting*, first match wins:

| Column | Meaning |
| --- | --- |
| **Sorting** | Evaluation order of the rules. |
| **Table name** / **Field name** | The target D365 table and key field to match (e.g. `custinvoicejour` / `InvoiceId`). |
| **Value** | The value to match — usually a [placeholder](../Functional-Guide/Placeholders.md) such as `%InvoiceIdMYSUPPLY%` that is expanded from the payload. |
| **Document template** | The Raptor document template used to tag/archive the document (e.g. `Templates\R2B\SalesInvoice`). |

![Raptor connector setup mapping form](/.attachments/22_raptor_setup.png)

*Behind the Raptor connector setup button. Each row maps a target table/field and a document template; the Value column reuses the %InvoiceIdMYSUPPLY% placeholder to find the record to attach to.*

A global parameter *Use Raptor template for attachments* (on the Parameters form) extends the document template to attachments as well. The archive fields on the processor map to `NANExaArchiveXml`, `NANExaArchivePdf` and `NANExaArchiveEmail`; the mapping rows live in `NANExaConnectorRaptorTable`.
