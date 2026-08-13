<!-- nav: PIW — Purchase invoice workflow | id: piw -->
# PIW — Purchase invoice workflow

Model `InputOutputFrameworkV2 PIW` enhances purchase-to-pay with e-invoicing.

It integrates purchase invoice processing with international e-invoice standards — chiefly **Peppol** — and OCR capture, plus vendor master and bank synchronisation.

#### What it contributes

-   **Peppol handlers** — inbound Peppol e-invoice with header and line parsing.
-   **Readsoft handler** — OCR-based invoice capture.
-   **UBL parser classes** (`NANWFUblParse*`) — typed, hierarchical parsing of UBL invoice documents.
-   **Vendor sync** — outbound vendor and vendor-bank synchronisation handlers.

`Peppol``Readsoft``UBL 2.x``Vendor sync`
