<!-- nav: Outbound handlers | id: handlers-out -->
# Outbound handlers

Click any handler card to expand the full detail. out = extends `NANHandlerOut`.

### NANHandlerOutDR

*out · Event · Direct — Document routing printer — WHS labels*

Routes a WHS/warehouse label payload to any Smart Connect processor **synchronously**, without interrupting the standard D365 WHS print flow. The handler is a transparent pass-through — stream and filename are injected by `NANDocumentRoutingLabels` before the handler starts.

#### When is it triggered?

Every time D365 Warehouse Management prints a **WHS label** (license plate, container, shipment, wave, work). The extension `WhsDocumentRouting_NAN_Extension` intercepts `printLabelPrintCommandToPrinterWithEncoding()` and hijacks the label body before it reaches the physical printer. Compatible with `WhsCustomLabelPrintService` for third-party label APIs.

#### Complete flow (numbered steps)

| # | What happens | Class / object |
| --- | --- | --- |
| 1 | D365 WHS label print initiated (pack, license plate, wave…) | `WhsDocumentRouting::printDocument()` |
| 2 | Extension captures label layout ID into a thread-static buffer | `WhsDocumentRouting_NAN_Extension` → `NANDocumentRoutingStatic::labelLayout` |
| 3 | Label print command generated; context singleton captures layout | `WhsLabelPrintCommandGenerator_Class_NAN_Extension` → `NANWhsLabelPrintCommandGeneratorContext` |
| 4 | *Optional* — custom label service pre-handler buffers contract | `WhsCustomLabelPrintService_Events_NAN` → `NANDocumentRoutingStatic::CustomContract` |
| 5 | NAN intercepts the printer send; resolves layout + printer template | `NANDocumentRoutingLabels::process()` |
| 6 | Looks up `NANLabelPrinterTemplateTable` for a wrapper template containing `$body$` | `NANLabelPrinterTemplateTable::find(printerName)` |
| 7 | If `WHSLabelLayout.NANAzurePath` set, prepends Azure folder to filename | Custom field on standard table |
| 8 | Instantiates handler; sets UTF-8 encoded label stream + filename | `NANHandlerOutDR.setStreamContentAndFilename()` |
| 9 | Creates and runs a *Direct* processor synchronously (no-throw so WHS is not blocked) | `NANProcessorOutDirect.setNoThrow(true)` |
| 10 | Payload delivered to the configured connector (Blob, File share, API, queue) | `NANConnecter.execute()` |
| 11 | Static buffers cleared; D365 continues normal print | `NANDocumentRoutingStatic::labelLayout = null` |

#### Setup table: `NANLabelPrinterTemplateTable`

| Field | Type | Purpose |
| --- | --- | --- |
| `PrinterName` | WHSPrinterName (PK) | Printer identifier from `WHSSysCorpNetPrinters` |
| `Template` | Str1260 | Wrapper with `$body$` placeholder for the raw ZPL/label content |

#### Custom field added to standard table

| Standard table | Field | Label | Purpose |
| --- | --- | --- | --- |
| `WHSLabelLayout` | `NANAzurePath` (String255) | Azure directory extension | Azure folder prepended to the filename when routing labels to cloud storage |

**Variables:** none (stream/filename injected externally)

### NANHandlerOutER

*out · Event — Electronic Reporting export*

Receives ER-generated content (stream + filename) and forwards it to the processor's connector. The ER framework generates the document; this handler is the bridge that gets it into Smart Connect. Base class for `NANHandlerOutDMSUbl` and `NANHandlerOutDMSProjectInvoice`.

**Flow:** `ER format run` → `NANHandlerOutER` → `Connector`

> **Info: How to use**
>
> Configure an ER destination of type *9A Smart Connect* and set the processor. When the ER format runs, output is handed to this handler. The *9A Smart Connect* print medium is registered as `SRSPrintMediumType.NANEdi`.

**Variables:** none · **Connector:** any file/API type

### NANHandlerOutPD

*out · Event — Print destinations (SSRS) export*

Receives a pre-generated SSRS report from the *9A Smart Connect* print destination and forwards it via the connector. Triggered when a report is printed with the 9A Smart Connect output type selected in Print Management.

**Flow:** `SSRS print` → `Print Management → 9A Smart Connect` → `NANHandlerOutPD` → `Connector`

**Variables:** `Directory`, `Prefix`, `Postfix`, `Table` · **Enum ext:** `SRSPrintMediumType.NANEdi`

### NANHandlerOutAPI

*out · Event — Out to API*

Generic REST API output handler. The `Action` variable sets the HTTP verb; the processor payload is the request body.

**Flow:** `Payload` → `NANHandlerOutAPI` → `API connector → HTTP endpoint`

**Variables:** `Action` (GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS) · **Connector:** API

### NANHandlerOutGenerateER

*out · Event — Generate Electronic Report (active ER execution)*

Unlike `NANHandlerOutER` (receives already-generated ER output), this handler **actively runs the ER format itself**. It is the engine behind MySupply and Peppol outbound e-invoicing — one processor per invoice type, each with its own ER format mapping.

**Flow:** `Event (source record)` → `NANHandlerOutGenerateER` → `ERObjectsFactory runs format → NANERFileDestinationInMemory` → `Connector`

Binds `ERModelDefinitionDatabaseContext` to the source record (e.g. `CustInvoiceJour`), runs via `ERFormatMappingRun` in-memory, and sets the result as payload.

**Variables:** `ERFormatMappingId` · **Connector:** any

### NANHandlerOutGenerateER_BusinessDocumentSubmission

*out · Event — Generate ER + register business-document submission*

Extends `NANHandlerOutGenerateER`: after generating the Electronic Report for the invoice, it also registers the outcome in the standard D365 `BusinessDocumentSubmission` table (state *Completed*), so the posted `CustInvoiceJour` / `ProjInvoiceJour` is tracked as submitted from F&O's own e-invoicing status. Use it when the platform must know an e-invoice was sent (in addition to the transport itself).

**Flow:** `Event (invoice)` → `NANHandlerOutGenerateER (runs ER)` → `Connector` → `register BusinessDocumentSubmission = Completed`

**Variables:** `ERFormatMappingId` · **Connector:** any

### NANHandlerOutDmf

*out · Event · loop — Data Management Framework export*

Runs a DMF definition-group export, then iterates the exported files (downloading from Azure Blob) returning them one-by-one to the connector. Sets `loop = true` while more files remain.

**Flow:** `NANHandlerOutDmf` → `DMF definition group export → NANDmfExport` → `Blob download (per file)` → `Connector`

**Variables:** `DefinitionGroup` · **Note:** when exporting multiple entities, sequence must start at 1

### NANHandlerOutDmfXmlToJson

*out · Event · loop — DMF export XML → JSON*

Extends `NANHandlerOutDmf`. After the DMF export converts XML to JSON via Newtonsoft `JsonConvert::SerializeXmlNode` and overrides the extension to `.json`.

**Variables:** `DefinitionGroup` · **Extension:** auto-set to `json`

### NANHandlerOutPaymentFile

*out · Periodic — Payment file export*

Scheduled export producing a UTF-8 CSV with a timestamped filename. Type is explicitly `Periodic` (not event-driven).

**Variables:** none · **Type:** Periodic

### NANHandlerOutTungstenVendors

*out · Event — Tungsten vendors export*

Reads `VendTable` + postal addresses, maps to Kofax supplier model, serialises for Tungsten.

| Source | Target (Kofax supplier) |
| --- | --- |
| AccountNum | SupplierNumber |
| Name | Name |
| NameAlias | Description |
| VATNum | VATNum |
| PostalAddress.Street/ZipCode/City/Country | Address fields |
| PaymentTermId, PaymentMode, Currency | Payment fields |

**Variables:** none · **Connector:** Tungsten/Kofax

### NANHandlerOutTungstenVendorBanks

*out · Event — Tungsten vendor banks export*

Reads `VendBankAccount` (joined to `VendTable`), validates IBAN/account number, serialises to Kofax bank-account model.

| Source | Target | Note |
| --- | --- | --- |
| VendTable.AccountNum | SupplierNumber |  |
| BankIBAN → AccountNum (fallback) | AccountNumber | IBAN preferred |
| IBAN present? | AccountNumberType | iban / bankgiro |
| BankName | BankName |  |

**Variables:** none · Warning logged if both IBAN and account number missing

### NANHandlerOutWFVendors

*out · Event · PIW — Readsoft online export vendors*

Queries `PylWFExportReadSoftOnlineVendor`, maps vendor + address to Kofax supplier model (same as TungstenVendors, country hardcoded to `'NLD'`), serialises via `Kofax::SuppliersToStream()`.

**Variables:** none · **Reference:** `'vendors'`

### NANHandlerOutWFVendorBanks

*out · Event · PIW — Readsoft online export vendor banks*

Queries `PylWFExportReadSoftOnlineVendorBank`, maps vendor bank accounts to Kofax model, serialises via `Kofax::SuppliersBankToStream()`.

**Variables:** none · **Reference:** `'vendorbanks'`

### NANHandlerOutDMSUbl

*out · Event · DMS — 9A Raptor DWH — ER UBL export*

Extends `NANHandlerOutER`. After receiving ER-generated UBL: parses XML → finds `CustInvoiceJour` → archives to Raptor.

| Step | Action | Processor flag |
| --- | --- | --- |
| 1 | Parse UBL namespace (cbc/cac or n2/n1) | — |
| 2 | Extract `/Invoice/ID` → look up `CustInvoiceJour` | — |
| 3 | Archive XML to Raptor DWH via `NANExaUtils::uploadToDocWarehouseStream()` | `NANExaArchiveXml = Yes` |
| 4 | Extract + archive embedded PDF (base64 from XML) | `NANExaArchivePdf = Yes` |
| 5 | Forward UBL stream via connector | — |

**Processor fields:** `NANExaDocumentTemplate`, `NANExaArchiveXml`, `NANExaArchivePdf`

### NANHandlerOutDMSProjectInvoice

*out · Event · DMS — 9A Raptor DWH — ER project invoice export*

Same as `NANHandlerOutDMSUbl` but targets `ProjInvoiceJour`; also decodes + archives a base64 image attachment if present.

**Processor fields:** `NANExaDocumentTemplate`, `NANExaArchiveXml`, `NANExaArchivePdf`
