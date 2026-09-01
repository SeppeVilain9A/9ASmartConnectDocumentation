<!-- nav: EB — Electronic banking | id: eb -->
# EB — Electronic banking

Model `InputOutputFrameworkV2 EB` adds banking and payment processing.

It integrates D365 cash management with ISO 20022 payment formats and bank reporting through the **Cobase** banking platform.

#### What it contributes

-   **Cobase connector** (`NANEBConnecterCobase`) — a new connector type `Cobase` (enum `NANConnecterType::EBCobase`) that extends the API connector with OAuth2 client-credentials authentication secured by an X.509 client certificate.
-   **Inbound statements** (`NANEBHandlerInCobaseReportFiles`) — retrieves compressed bank statement archives from Cobase and imports the extracted XML (CAMT.053 / CAMT.052).
-   **Outbound payments** — ISO 20022 PAIN.001 payment initiation files, with an upload log tracking status, reference and file size.

`Cobase``ISO 20022``PAIN.001``CAMT.053 / .052``X.509``OAuth2`

### Cobase connector setup

Selecting connector type **Cobase** reveals a dedicated **Cobase** tab on the connector form with these fields:

| Field | Table field | Purpose |
| --- | --- | --- |
| **Authentication URL** | `AuthUrl` | OAuth2 token endpoint used to obtain the bearer token. |
| **Resource URL** | `ResourceUrl` | Base URL of the Cobase API. |
| **Client ID** | `ClientId` | OAuth2 client identifier. |
| **Client secret** | `ClientSecret` | OAuth2 client secret. When Key Vault is enabled (`NANParameterTable.UseKeyvault`), the field offers a Key Vault secret lookup instead of a plain-text value. |
| **Use token cache** | `UseTokenCache` | Cache the acquired bearer token and reuse it until shortly before it expires instead of authenticating on every call. |

A **certificate** button on the tab links to `NANConnecterCertificateTable`; the X.509 certificate it points to is used as the client certificate for the token request.

> **Info: Credential storage**
>
> The client secret can live in the D365 database or, when *Use Key Vault* is enabled on the Parameters form, in Azure Key Vault — the field then shows a secret lookup rather than plain text. See [Authentication and secrets](../technical-reference/authentication-and-secrets.md).

### Inbound bank reporting

`NANEBHandlerInCobaseReportFiles` downloads the reporting archive from the Cobase `reporting/download/statements` endpoint, detects and unpacks the compression format, extracts every `.xml` entry, and inserts each statement into the Pylades `PylEBResource` table for downstream bank-statement processing.

-   **Compression auto-detection** — the archive is recognised as **Zip**, **GZip** or **Bin** (uncompressed) and the detected value is stored on the queue record in `NANQueueTable.NANEBCompressionFormat` (enum `NANEBCompressionFormat`) for traceability.
-   **Import format & bank variant** — two handler parameters select the statement format (e.g. CAMT.053 / CAMT.052) and the bank variant. Their lookups are backed by the in-memory helper table `NANEBLookupTable`, populated from the Pylades import-format / bank-variant enums.
