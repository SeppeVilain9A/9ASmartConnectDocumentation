<!-- nav: Standard-F&O extensions | id: custom-fields -->
# Extensions to standard D365 F&O

Beyond its own tables, Smart Connect **extends standard Dynamics 365 F&O**: it adds fields, tabs, action buttons and a print destination to out-of-the-box forms, and new values to standard enums. This section lists everything it touches — first where you *see* it on a form, then the underlying table fields.

### Standard forms & UI extended

These are the places a user actually meets Smart Connect on a standard F&O form (delivered through form extensions):

| Standard form | What Smart Connect adds | What it is for |
| --- | --- | --- |
| **Postal address**
`LogisticsPostalAddress` | A *Global location number* (GLN) field in the address header | Store the GLN per address so inbound Peppol invoices match the right partner. |
| **Customer**
`CustTable` | A *9A Smart Connect* action-pane button → *Business process configuration* | Map this customer to the processor(s) that handle its documents. |
| **Vendor**
`VendTable` | A *9A Smart Connect* button (Business process configuration) and an *Integration* tab with an *EDI format* field | Map the vendor to processors and record its EDI format. |
| **Sales order**
`SalesTable` | An *Integration* tab: *Exported* and *Re-export on confirm* | See whether the order was sent to the partner and force a re-send on confirmation. |
| **Purchase order**
`PurchTable` | An *Integration* tab (export tracking) | Track the outbound export of the purchase order. |
| **Posted journals**
`CustInvoiceJournal`, `CustPackingSlipJournal`, `CustConfirmJournal`, `VendPurchOrderJournal`, `ProjInvoiceJournal` | A *9A Smart Connect* button that creates/resends an event | Manually push (or re-push) a posted invoice / packing slip / confirmation through Smart Connect. |
| **Print destination**
`SRSPrintDestinationSettings` | A *9A Smart Connect* tab with *Process* and *File format* | Route a printed / reported document straight to a Smart Connect processor (the “9A EDI” print medium). |
| **Electronic Reporting**
`ERFormatDestinationSettings`, `ERImportFormatSourceSettings` | Smart Connect as an ER *destination* / *source* | Send or receive ER-generated documents through a connector. |
| **WHS label / external service**
`WHSLabelLayout`, `WhsExternalServiceInstance` | An *Azure directory* field; a *Processor* link | Route warehouse labels to Azure storage and bind a WHS service to a processor. |

> **Info: How the print destination works**
>
> The `SRSPrintMediumType` enum gains a **9A EDI** value, so any SSRS report or Print management setup can pick “9A EDI” as its destination and hand the document to the chosen processor — no code required.

### GLN (Global Location Number)

A **GLN** is a 13-digit identifier (EAN/GS1) used in Peppol e-invoicing to identify companies, locations and functions. Smart Connect adds it to multiple staging and master-data tables so that inbound invoices can be matched to the correct vendor by GLN even when a VAT number is absent.

| Standard table | Field added | Label | Purpose |
| --- | --- | --- | --- |
| `LogisticsPostalAddress` | `NANGlobalLocationNum` | Global location number | GLN on every postal address (used for vendor GLN lookup by `VendTable::NANGetVendorFromGLN()`) |
| `CustCustomerV2Staging` | `NANAddressGlobalLocationNum` | Global location number | GLN for primary address on DMF customer staging V2 |
| `CustCustomerV2Staging` | `NANInvoiceAddressGlobalLocationNum` | Global location number | GLN for invoice address |
| `CustCustomerV2Staging` | `NANDeliveryAddressGlobalLocationNum` | Global location number | GLN for delivery address |
| `CustCustomerV3Staging` | `NANAddressGlobalLocationNum` | Global location number | Same as V2 equivalent (V3 entity) |
| `CustCustomerV3Staging` | `NANInvoiceAddressGlobalLocationNum` | Global location number |  |
| `CustCustomerV3Staging` | `NANDeliveryAddressGlobalLocationNum` | Global location number |  |
| `DirPartyLocationPostalAddressV2Staging` | `NANGlobalLocationNum` | Global location number | GLN on party-location postal address DMF staging |
| `DirPartyV2Staging` | `NANAddressGlobalLocationNum` | Global location number | GLN on party address DMF staging |
| `VendVendorV2Staging` | `NANAddressGlobalLocationNum` | Global location number | GLN on vendor DMF staging |

![Global location number field on a customer postal address](/.attachments/28_ext_address_gln.png)

*GLN on a customer address. Open a customer → Registration IDs (or Manage addresses): Smart Connect adds the Global location number field at the top of the address (LogisticsPostalAddress.NANGlobalLocationNum), used by VendTable::NANGetVendorFromGLN() to match inbound Peppol invoices.*

### WHS label routing

| Standard table | Field | Type | Label | Purpose |
| --- | --- | --- | --- | --- |
| `WHSLabelLayout` | `NANAzurePath` | String255 | Azure directory extension | Optional Azure folder prepended to the filename when routing WHS labels to cloud storage |

![9A Smart Connect directory extension field on the Label layout form](/.attachments/29_ext_whs_labellayout.png)

*Label layout → Azure directory. On Warehouse management › Setup › Label layout (WHSLabelLayout) Smart Connect adds the 9A Smart Connect directory extension field (NANAzurePath) so the printed label file is written to an Azure storage folder.*

![Print variable template button on the Label printers form](/.attachments/31_ext_whs_printers.png)

*Label printers → Print variable template. On Label printers (WHSSysCorpNetPrinters) Smart Connect adds a Print variable template action-pane button, letting you map print-time variables for the external label service.*

### Warehouse external service (Smart Connect processor link)

| Standard table | Field | Type | Purpose |
| --- | --- | --- | --- |
| `WhsExternalServiceInstance` | `NANProcessId` | NANProcessorId | FK to `NANProcessorTable`; links a WHS external service instance to a Smart Connect processor |

![Processor Id field on the External service instances form](/.attachments/30_ext_whs_extservice.png)

*External service instances → Processor Id. On External service instances (WhsExternalServiceInstance) Smart Connect adds the Processor Id field (NANProcessId) that binds a warehouse external service to a Smart Connect processor.*

### Processor / parameter extensions (DMS module)

| Table extended | Field | Type | Purpose |
| --- | --- | --- | --- |
| `NANParameterTable` | `NANExaUseRaptorTemplateForAttachments` | NoYes | Use Raptor document templates for archiving attachments in the DMS flow |
| `NANProcessorTable` / `NANProcessorStaging` | `NANExaDocumentTemplate` | EXADocumentTemplate | Reference to the Raptor document template used for tagging |
| `NANProcessorTable` / `NANProcessorStaging` | `NANExaArchiveXml` | NoYes | Archive the XML document to Raptor DWH |
| `NANProcessorTable` / `NANProcessorStaging` | `NANExaArchivePdf` | NoYes | Archive the embedded PDF to Raptor DWH |
| `NANProcessorTable` | `NANExaArchiveEmail` | NoYes | Archive email records to Raptor DWH (Tungsten flow) |

### EB module

| Table extended | Field | Type | Purpose |
| --- | --- | --- | --- |
| `NANQueueTable` | `NANEBCompressionFormat` | NANEBCompressionFormat (enum) | Compression format for Cobase/ISO 20022 banking file outputs |

### Enum extensions

| Standard enum | New value | Label | Module | Purpose |
| --- | --- | --- | --- | --- |
| `SRSPrintMediumType` | `NANEdi` | 9A EDI | CORE | Registers Smart Connect as an SSRS print destination type |
| `ModuleAxapta` | `NANSmartConnect` | 9A Smart Connect | CORE | Module registration in the standard D365 module list |
| `NANQueueSupportedForms` | `EXAPurchInvoiceImported` | EXAPurchInvoiceImported | DMS | Queue form trigger for Raptor All invoices DMS inbound integration |
| `NANConnecterType` | `ExaRaptor` | Raptor | DMS | Connector type for the ExaRaptor document warehouse |
| `NANConnecterType` | `EBCobase` | Cobase | EB | Connector type for the Cobase banking gateway |
