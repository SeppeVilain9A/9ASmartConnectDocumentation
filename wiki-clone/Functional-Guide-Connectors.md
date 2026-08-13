<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Connectors

A **Connector** establishes a connection to an external application — Microsoft Azure Storage, external JSON APIs, SOAP services, file servers and more — that is used when a process runs.

For example, a connector is needed when you must transmit Electronic Reporting documents to an external API, or store invoice PDF files in Azure Storage. A single connector can be reused by many processors.

> **Info: Looking for what each field does?**
>
> This page explains connectors *functionally*. For a field-by-field explanation — every connector field, and exactly which fields appear per *Type* and per *Authentication type* — jump to the [**complete connector field reference**](Field-and-Parameter-Reference-Connector-fields).

### Connector types

The **Type** defines the external application the connector talks to. Based on the selected type, the form reveals only the fields relevant to that connection.

| Type (on screen) | Use it for | Direction |
| --- | --- | --- |
| **API** | Connecting to an Application Programming Interface (REST). | in / out |
| **Azure blob** | Single blob storage — large files that are not needed frequently. | in / out |
| **Azure file share** | More complex, multi-level folder structures and manual file handling. | in / out |
| **Azure container** | A single container or one-level-deep folder structure; automated service flows. | in / out |
| **URL** | Direct access to a web resource/endpoint over HTTP/HTTPS. | out |
| **FTP** | File transfer over FTP (batch file exchange). Not encrypted — use SFTP where possible. | in / out |
| **SFTP** | Secure file transfer; encrypts commands and data. Supports certificates. | in / out |
| **AS2** | Secure, reliable EDI transactions over the internet with message integrity and non-repudiation. | out |
| **Tungsten** | Exchanging invoices and vendor/vendor-bank data via the Tungsten (Readsoft) network. | in / out |
| **Babelway SOAP** | Interacting with SOAP web services managed through Babelway. | in |
| **SharePoint** | Reading/writing document libraries via the Microsoft Graph API. | in / out |
| **Attachment** | Attaching generated files to a D365 record via Document Management. | out |
| **User interface** | Manual upload/download directly through the application — ad-hoc or exception handling. | in / out |

### Authentication

The **Authentication type** controls how the connector proves its identity to the external application:

#### API / URL authentication

-   **Basic** — basic authentication in the header.
-   **Azure** — OAuth2 with a minimum of TLS 1.2.
-   **OAuth** — standard OAuth for non-Microsoft applications.
-   **API key** — a web API key sent as authentication.

Supporting fields include *Audience*, *Grant type* (Client credentials, Authorization code, Refresh token, Password), *Media type*, *Resource URL*, *Client ID / secret*, *Content type* and *Use token cache*.

#### Azure storage authentication

-   **SAS credential** — a time-limited, scoped Shared Access Signature token that grants specific permissions without exposing the account key.
-   **Connection string** — account name, key and endpoint bundled in one string.
-   **Shared Key credential** — authenticate with the storage account key.

> **Warning: Protect your secrets**
>
> Whenever possible, store sensitive values (Client ID, secret, connection string, password) in **Azure Key Vault** rather than plain-text fields. See [Parameters](Functional-Guide-Setup-and-parameters) and [Authentication & secrets](Technical-Reference-Authentication-and-secrets).

### Create a connector — step by step

1.  **Open** *Definitions > Connectors* and select **New**.
2.  **Enter** a unique *Connector Id* and a *Description*.
3.  **Choose the Type** (e.g. Azure file share). The form now shows only the fields for that type.
4.  **Configure authentication** — pick the authentication type and complete the credential fields (or select Key Vault secrets).
5.  **Add extras if needed** — custom API headers, certificates (AS2 signing/encryption or SFTP authentication).
6.  **Test** — for API/OAuth connectors, use *Test authentication* to validate the credentials.
7.  **Save.** The connector is now available for selection on any processor.

![Connectors list in D365 F&O](attachments/02_connectors_list.png)

*Connectors list. The highlighted New button (1) adds a connector. Existing connectors appear in the left list.*

![Create a connector — numbered fields](attachments/03_connector_new.png)

*Create a connector. Complete the highlighted fields in order — the Type you pick reveals only the fields relevant to it.*

1.  Enter a unique *Connector Id*
2.  Enter a *Description*
3.  Choose the *Type* (API, Azure file share, SFTP…)
4.  Choose the *Authentication type*
