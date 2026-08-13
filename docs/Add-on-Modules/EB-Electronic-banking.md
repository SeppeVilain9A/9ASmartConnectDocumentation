<!-- nav: EB — Electronic banking | id: eb -->
# EB — Electronic banking

Model `InputOutputFrameworkV2 EB` adds banking and payment processing.

It integrates D365 cash management with ISO 20022 payment formats and bank reporting through the **Cobase** banking platform.

#### What it contributes

-   **Cobase connector** (`NANEBConnecterCobase`) — extends the API connector with X.509 certificate authentication (TLS 1.2).
-   **Inbound statements** (`NANEBHandlerInCobaseReportFiles`) — processes ZIP-delivered bank statement XML (CAMT.053 / CAMT.052).
-   **Outbound payments** — ISO 20022 PAIN.001 payment initiation files, with an upload log tracking status, reference and file size.

`Cobase``ISO 20022``PAIN.001``CAMT.053 / .052``X.509`
