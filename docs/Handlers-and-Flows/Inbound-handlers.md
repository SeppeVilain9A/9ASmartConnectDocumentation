<!-- nav: Inbound handlers | id: handlers-in -->
# Inbound handlers

Click any card to expand. in = extends `NANHandlerIn`.

### NANHandlerInDmf

*in · Event — Data Management Framework import*

Feeds the inbound payload stream into a standard DMF import for the configured definition group and entity. Records the DMF execution ID for log lookup.

**Flow:** `File (CSV/XML/JSON)` → `NANHandlerInDmf` → `NANDmfImport → DMF definition group` → `D365 entity`

**Variables:** `DefinitionGroup`, `Entity`

### NANHandlerInDmfNoHeader

*in · Event — DMF import — inject header*

Extends `NANHandlerInDmf`. If the first line does not contain the expected header row (from `processor.HeaderField`), prepends it before running the DMF import — essential for header-less CSV feeds.

**Variables:** `DefinitionGroup`, `Entity` · uses `processor.HeaderField`

### NANHandlerInER

*in · Event — Electronic Reporting import*

Validates the inbound payload and passes it to Electronic Reporting for import-side processing (e.g. bank statement import via ER). Minimal pass-through.

**Variables:** none

### NANHandlerInDMSUbl

*in · Event · DMS — UBL invoice import — V1*

Parses Peppol UBL (namespace-aware: cbc/cac or n2/n1), resolves the vendor, creates an `EXAPurchInvoiceImported` record and archives. Single-pass — no step recovery on failure.

#### Field mappings: UBL XML → All invoices (`EXAPurchInvoiceImported`)

| UBL XML path | Transformation | Target field |
| --- | --- | --- |
| `AccountingSupplierParty/…/EndpointID @schemeID=0088` | GLN → `VendTable::NANGetVendorFromGLN()` | `VendAccount` |
| `AccountingSupplierParty/…/EndpointID @schemeID≠0088` | VAT/KBO → `NANVatNumSql::getVendorFromVATRegNum()` | `VendAccount` |
| `…/PartyTaxScheme/CompanyID` | Fallback VAT lookup | `VendAccount` |
| `/Invoice/DocumentCurrencyCode` | Direct | `CurrencyCode` |
| `/Invoice/InvoiceTypeCode` | `380` → Debit · other → Credit | `DebitCredit` |
| `/CreditNote` element exists | Forces Credit | `DebitCredit` |
| `/Invoice/IssueDate` | `str2Date(val, 321)` | `DocumentDate` + `TransDate` |
| `/Invoice/DueDate` | `str2Date` or `dateNull()` | `DueDate` |
| `/Invoice/ID` | Direct | `InvoiceId` |
| `LegalMonetaryTotal/TaxInclusiveAmount` | `str2Num()` | `InvoiceAmount` |
| `LegalMonetaryTotal/TaxExclusiveAmount` | `str2Num()` | `BaseAmount` |
| `TaxTotal/TaxAmount` | `str2Num()` | `TaxAmount` |
| `OrderReference/ID` or `BuyerReference` | `PurchTable::exist()` | `IsPurchaseOrder` / `PurchId` |
| `InvoiceLine/CommodityClassification @listID='PO'` | Loop + validate each | `PurchLinkEntity.PurchId` |
| — | `processor.ProcessId` | `ReleaseUser` |
| — | Hardcoded | `Executed = Yes` |

#### Invoice line (always one summary line)

| Source | Target line field |
| --- | --- |
| Invoice header DocNo | `DocNo` |
| First found PO | `PurchId` |
| Header amounts | `TaxAmount`, `BaseAmount`, `InvoiceAmount` |
| Hardcoded | `Description = "Invoice Total Line"` |

**Variables:** `Store_BUYER_VAT_NUMBER` · **Queue table:** none (single-pass)

### NANHandlerInDMSUblV2

*in · Event · 5 steps · DMS — UBL invoice import V2 — archive-first, resumable*

V2 applies the same UBL → All invoices field mappings as V1 (see above) but adds five resumable processing steps, better vendor lookup, PO-number regex, and document tagging. State is persisted in `NANQueueHandlerInDMSUblTable` between retries.

#### Step breakdown

| Step | Action | On error — resume from |
| --- | --- | --- |
| **1** | Archive XML to Raptor DWH linked to queue record (`NANExaArchiveXml` flag) | Step 1 (full retry) |
| **2** | Archive attachments from `AdditionalDocumentReference` list; duplicate detection via existing Raptor tags | Step 2 (skip step 1) |
| **3** | Vendor lookup (GLN → VAT/KBO → CompanyID) + `importInvoice()` + `importInvoiceLines()`. Save vendor + docNo to queue table | Step 3 (skip archive steps) |
| **4** | Tag archived docs with All-invoices record → `EXADocuHelper::addTagsFromToDocuments()` | Step 4 (skip 1–3) |
| **5** | Reinitialise invoice rules → `purchInvoiceImportedEntity.reinitializeInvoice()` | Step 5 only |

#### V2 improvements over V1

| Feature | V1 | V2 |
| --- | --- | --- |
| Raptor archive timing | Last step | **First step** |
| Vendor lookup | GLN only | **GLN + VAT/KBO + DUNS** |
| Manual vendor override | No | **Yes — set from queue form** |
| PO-number regex | No | **Yes** (`NANExaPurchRegexTable`) |
| Error recovery | Full restart → duplicates | **Resume at failed step** |
| Original PO text stored | No | **Yes** (audit trail) |

#### Queue state table: `NANQueueHandlerInDMSUblTable`

| Field | Type | Persists |
| --- | --- | --- |
| `QueueId` | NANQueueId (PK/FK) | Links to `NANQueueTable` |
| `VendAccount` | VendAccount | Vendor resolved in step 3; reused in retries |
| `DocNo` | EXADocNo | All-invoices record id; used in steps 4+5 |

**Variables:** `Store_BUYER_VAT_NUMBER`

### NANHandlerInDMSUbl\_RO

*in · Event · DMS — UBL invoice import — Romania*

Romanian variant. `InvoiceTypeCode 380` = Debit, any other = Credit. Maps all standard UBL amounts. Attaches documents inline rather than archiving to Raptor.

**Variables:** none · **Note:** code comment reads "DONT BLAME ME — duplicate code that consultant wants to keep"

### NANHandlerInDMSTungsten

*in · Event · DMS — Tungsten (Readsoft) invoice import*

Parses Tungsten (Kofax) XML into a typed `InvoiceHeader` POCO (not raw XPath). Maps fields to All invoices, archives XML/PDF and optionally email to Raptor.

#### Field mappings (Tungsten InvoiceHeader → All invoices)

| Tungsten property | Transformation | Target field |
| --- | --- | --- |
| `DebitCredit` | 'Debit' → Debit; else Credit | `DebitCredit` |
| `IsPurchaseOrder` | 'Yes' → Yes; else No | `IsPurchaseOrder` |
| `DocumentDate` | `convertFromDateTime()` → strip time | `DocumentDate`, `DueDate` |
| `TransDate` | `convertFromDateTime()` | `TransDate` |
| `InvoiceAmount` | Direct | `InvoiceAmount` |
| `CurrencyCode` | Direct | `CurrencyCode` |
| `VendAccount` | Resolved by Tungsten parser | `VendAccount` |
| `BaseAmount` | Direct | `BaseAmount` |
| `InvoiceId` | Direct | `InvoiceId` |
| `TaxAmount` | Direct | `TaxAmount` |
| `InvoiceOrderNumber` | `PurchTable::exist()` | `PurchId` (line) |
| `LitOrderNumbersArray` | Loop + validate each | Additional PurchId links |

**Variables:** `Store_BUYER_VAT_NUMBER` · archives XML, PDF + optional email

### NANHandlerInWFReadsoft

*in · Event · PIW — Readsoft online XML/PDF import*

Reads Readsoft XML, detects company from document content, switches D365 company context, creates `PylWFVendInvoiceResource` (OCR = Yes). Optionally attaches a secondary PDF payload. The resource is then processed by the PIW invoice workflow.

**Variables:** `ResourceType` → `PylWFVendInvoiceResourceType.TypeId`

### NANHandlerInWFPeppol

*in · Event · PIW — Peppol e-invoice import — PIW workflow*

Reads Peppol UBL (unwrapping POST envelope if present), converts to PIW format via `NANWFUblToIwf`, creates `PylWFVendInvoiceResource` (OCR = Yes), attaches embedded document.

> **Tip: PIW vs DMS**
>
> Use **PIW** (`NANHandlerInWFPeppol`) when invoices feed the PIW purchase invoice workflow engine. Use **DMS** (`NANHandlerInDMSUblV2`) when invoices feed directly into Raptor All invoices.

**Variables:** `ResourceType`
