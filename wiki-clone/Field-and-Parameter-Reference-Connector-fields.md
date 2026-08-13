<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Connector — complete field reference

Every field that can appear on the *Connector* form, what it does, and exactly which fields the form reveals for each **Type** and each **Authentication type**. The connector form is *adaptive*: choosing a Type switches the form to that connection's tab, and choosing an Authentication type shows only that method's credential group. Changing the Type clears the credential/resource fields so stale values are never carried over.

### All connector fields

Field names in `monospace` are the underlying table fields on `NANConnecterTable`. Several fields are re-labelled on screen depending on context (e.g. *Client Id* shows as *Username* for FTP).

| Field (on screen) | Table field | Type | What it does |
| --- | --- | --- | --- |
| **Connector Id** | `ConnecterId` | Id | Unique identifier and primary key of the connector. Read-only once created. |
| **Description** | `Description` | Text | Free-text name shown in lookups on the processor. |
| **Type** | `ConnecterType` | Enum | The external system the connector talks to. Selecting it decides which connector subclass runs and switches the form to the matching tab. |
| **Resource Url** | `ResourceUrl` | URL | Endpoint address — API base URL, FTP/SFTP host, or the Azure Blob/File share/Container URI. |
| **Authentication type** | `AuthType` | Enum | How the connector proves its identity. Reveals the matching credential group (see below). |
| **Client Id / Username** | `ClientId` | Text | OAuth client ID, FTP/SFTP username, or Azure Shared-Key account name. The label adapts to the Type/Auth. |
| **Client secret / Password** | `ClientSecret` | Secret | OAuth client secret, FTP/SFTP password, SAS token or storage key. Hidden; encrypted or Key-Vault-backed. |
| **Tenant** | `Tenant` | Text | Azure AD tenant ID (Azure / OAuth authentication). |
| **Authorization Url** | `AuthUrl` | URL | OAuth token endpoint (or the AS2 MDN return URL). |
| **Audience** | `Audience` | URL | OAuth audience / resource scope, used for Azure multi-tenant scenarios. |
| **Scope** | `Scope` | URL | OAuth scope parameter (e.g. `https://resource/.default`). |
| **Grant type** | `OAuthGrantType` | Enum | OAuth flow: Client credentials, Authorization code, Refresh token or Password. |
| **Auth form encoded body** | `ContentTypeFormEncodedBody` | Enum | For form-encoded token requests: send *Username/Password* or *Client Id/Secret* in the body. |
| **Bearer token** | `BearerToken` | Secret | A pre-shared bearer token for API Bearer authentication (an alternative to a full OAuth flow). |
| **Username** | `Username` | Text | Username for Basic auth or the OAuth password grant. |
| **Password** | `Password` | Secret | Password for FTP/SFTP or the OAuth password grant. Hidden. |
| **Use token cache** | `UseTokenCache` | Yes/No | Cache the OAuth access token and reuse it until it expires, instead of requesting a new one every call. |
| **Content type** | `ContentType` | Enum | API request body shape: String, Stream, ByteArray, FormUrlEncoded, SysUrlEncoded or FormDataFileStream. |
| **Media type auth** | `MediaType` | Enum | The Accept / Content-Type header for API requests: `application/xml`, `application/json` or `application/x-www-form-urlencoded`. |
| **Media type body** | `MediaTypeBody` | Enum | The Content-Type used for the API POST/PUT/PATCH body (separate from the header media type). |
| **Post if update not found** | `UpdateNotFoundCreate` | Yes/No | API: if a PUT/PATCH returns *404 Not found*, retry the call as a POST (create). |
| **Timeout in seconds** | `TimeoutInSeconds` | Int | Connection timeout for API / SharePoint calls. |
| **Enable response log** | `EnableResponseLog` | Yes/No | Store the connector/API responses for audit and debugging (see the queue response log). |
| **Storage authentication** | `StorageAuthType` | Enum | Azure storage auth mode: SAS credential, Connection string or Shared Key credential. |
| **Storage account name** | `StorageName` | Text | Azure storage account / container name (Connection-string mode). |
| **Connection string** | `ConnectionString` | Secret | Full Azure storage connection string, or the Kofax/Tungsten connection string. Hidden; encrypted or Key-Vault-backed. |
| **Port** | `Port` | Int | FTP/SFTP port (typically 21 for FTP, 22 for SFTP). |
| **Enable SSL** | `EnableSSL` | Yes/No | FTP/SFTP: use FTPS / TLS encryption. |
| **Trust self signed server certificate** | `TrustSelfSignedServer` | Yes/No | FTP/SFTP: accept a self-signed server certificate (skip validation). Use with care. |
| **Use working directory** | `UseWorkingDirectory` | Yes/No | FTP/SFTP: organise files into working subdirectories. Changing it recalculates the processor's hidden variable list. |
| **Disable filename cleaning** | `DisableFilenameCleaning` | Default/Yes/No | Per-connector override of the global filename-sanitisation setting: *Default* follows Parameters, *Yes* keeps names verbatim, *No* forces cleaning on. |

### Which fields appear per connector Type

Each Type opens a dedicated tab and shows only the fields it needs. Types that authenticate (API, URL, AS2, SharePoint) additionally show an *Authentication type* selector; the Azure storage types (Blob, File share, Container) show a *Storage authentication* selector instead.

| Type | Form tab | Fields shown |
| --- | --- | --- |
| **URL** | API / URL | Resource Url only (no authentication). |
| **API** | API / URL | Resource Url, Authentication type, Content type, Media type, Timeout, plus the selected auth group; optional custom headers. |
| **Azure blob** | Azure storage | Resource Url, Storage authentication, Storage account name / Connection string / account+key (per mode). |
| **Azure file share** | Azure storage | Same as Blob. Adds file-share sort options on the *processor* (see below). |
| **Azure container** | Azure storage | Same as Blob. |
| **FTP** | FTP | Resource Url (host), Port, Username, Password, Enable SSL, Trust self-signed, Use working directory, Disable filename cleaning. |
| **SFTP** | FTP | Same as FTP. Can authenticate with a certificate (see Certificates sub-table). |
| **AS2** | AS2 | Resource Url, Authentication type + auth group, and signing/encryption Certificates. |
| **Tungsten** (Kofax) | Kofax | Resource Url, Username, Password, Connection string. |
| **Babelway SOAP** | Babelway | Resource Url, Username/Client Id, Password/secret. |
| **SharePoint** | SharePoint | Resource Url (site), Authentication type (OAuth / Azure / Audience only), auth group, Timeout. |
| **Attachment / User interface** | — | No connection fields — files are attached to a record or uploaded manually. |

### Which fields appear per Authentication type

The *Authentication type* selector (API, AS2 and SharePoint tabs) reveals exactly one credential group:

| Authentication type | Fields revealed | How it is sent |
| --- | --- | --- |
| **Basic** | Username, Password | `Authorization: Basic base64(user:password)` |
| **Azure** | Client Id, Client secret, Tenant, Authorization Url | OAuth 2.0 client-credentials against Azure AD (TLS 1.2+). |
| **OAuth** | Client Id, Client secret, Tenant, Authorization Url, Grant type, Scope, Auth form encoded body (if form-encoded); Username + Password only for the password grant | Standard OAuth token request; token optionally cached. |
| **API key** | Client secret (the key value) | Sent as an `x-api-key` header. |
| **Audience** | Audience | Azure AD flow where the resource/audience is specified separately. |
| **Bearer token** | Bearer token | `Authorization: Bearer <token>` |

### See the form adapt — live examples

The same *New connector* form, with three different Types selected. Notice how each choice replaces the tab and reveals a different set of fields.

![Connector — Azure file share reveals storage authentication fields](attachments/13_connector_fileshare.png)

*Type = Azure fileshare. The form switches to the Azure storage tab and shows the storage-authentication fields.*

1.  Pick the *Storage authentication* mode (SAS / connection string / account key)
2.  Enter the storage account / share name
3.  Enter the *Resource URL*

![Connector — API with OAuth reveals the OAuth credential group](attachments/14_connector_api_oauth.png)

*Type = Api, Authentication = OAuth. The OAuth credential group appears.*

1.  Enter the *Client Id*
2.  Enter the *Client secret*
3.  Choose the *Grant type* (here, client\_credentials) — Scope, Authorization URL and token cache are alongside

![Connector — FTP reveals host, port and SSL fields](attachments/15_connector_ftp.png)

*Type = FTP. File-server fields appear — host, username, password, and:*

1.  The *Port*
2.  *Enable SSL* (with trust-self-signed and disable-filename-cleaning below)

### Azure storage authentication modes

| Storage authentication | Fields used | When to use |
| --- | --- | --- |
| **SAS credential** | Resource Url + Client secret (the SAS token) | Time-limited, scoped access without exposing the account key. Preferred. |
| **Connection string** | Connection string + Storage account name (container) | Quick setup where the full connection string is available. |
| **Shared Key credential** | Resource Url + Client Id (account) + Client secret (key) | Authenticate directly with the storage account key. |

### Credential storage — encryption vs Key Vault

How the secret fields (*Client secret*, *Connection string*, *Password*) behave is driven by two mutually-exclusive global parameters. The form swaps the input control accordingly:

| Parameter state | Secret fields become… |
| --- | --- |
| **Use keyvault = Yes** | A *Key Vault reference* lookup — you pick a secret name from the standard D365 Key Vault setup; the value never lives in the database. |
| **Encrypt credentials = Yes** (Use keyvault = No) | A direct text box; the value is encrypted at rest with the environment key. |
| **Both = No** | A direct text box stored as-is. Acceptable only in non-production. |

> **Warning: Mutually exclusive**
>
> *Use keyvault* and *Encrypt credentials* cannot both be on. Set them in [Parameters](Field-and-Parameter-Reference-Global-parameters); the connector form reads them in `init()` and shows either the Key Vault lookup or the direct input for every secret field.

### Connector sub-tables

#### Certificates `NANConnecterCertificateTable`

X.509 certificates attached to a connector. Key: Connector + Purpose.

-   **Purpose** — Authentication (client/login cert), Signing or Encryption (AS2 messages).
-   **Certificate** — the binary PKCS#12/PEM certificate (hidden).
-   **Password** — password that unlocks the certificate.
-   **Key Vault certificate ref** — alternatively, a reference to a Key-Vault-managed certificate.

AS2 uses a Signing *and* an Encryption certificate; SFTP can use an Authentication certificate.

#### Custom API headers `NANConnecterCustomAPIHeaderTable`

Extra HTTP headers added to every request an API connector makes. Key: Connector + Header name.

-   **Header name** — e.g. `X-Correlation-Id`.
-   **Header value** — the value to send.

Added after the default `Accept` header when the request is primed.
