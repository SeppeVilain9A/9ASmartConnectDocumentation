<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Global parameters — complete reference

The *Parameters* form holds one record per company and controls module-wide behaviour. Several parameters act as **master switches** that reveal fields on the processor and queue forms — those links are called out below.

### General tab

| Parameter | Table field | What it controls |
| --- | --- | --- |
| **Use keyvault** | `UseKeyvault` | Store connector secrets as Azure Key Vault references instead of in the database. Mutually exclusive with *Encrypt credentials*. Switches every secret field to a Key Vault lookup. |
| **Encrypt credentials** | `EncryptCredentials` | Encrypt connector secrets at rest with the environment key. Mutually exclusive with *Use keyvault*. |
| **Override event deletion** | `OverrideDeleteEvent` | Allow processed events to be deleted even when linked to a queue record (e.g. during testing). |
| **Full global error** | `GlobalErrorStack` | Show the full stack trace on errors instead of just the message. |
| **Manually upload files** | `ManualUpload` | `reveals fields` Enables the *Upload* / *Upload secondary* buttons on the queue form for inbound processors. |
| **Enable filename based selection** | `SearchOnFilenameBasedQuery` | `changes behaviour` Filter inbound files by filename/extension pattern before fetching; also maintains the hidden processor-variable exclusion list. |
| **Enable successor processor** | `EnableSuccessorProcessor` | `reveals fields` Master switch for process chaining — reveals the Successor processes group on processors. |
| **Enable processor multithreading** | `EnableProcessorMultithreading` | `reveals fields` Master switch for parallel processing — reveals *Use multithreading* and its worker settings, and the queue worker-status column. |
| **Disable filename cleaning** | `DisableFilenameCleaning` | `changes behaviour` Keep illegal filename characters instead of replacing them with underscores. Can be overridden per FTP/SFTP connector. |

### E-invoice tab

| Parameter | Table field | What it controls |
| --- | --- | --- |
| **Disable E-Invoice warnings** | `DisableEInvoiceWarnings` | Suppress validation warnings during e-invoice processing (Peppol, MySupply, …). |
| **Search function** | `RegistrationNumSearch` | How vendors/customers are matched on inbound e-invoices — by VAT number, by registration number, or both. |

> **Tip: Master switches to know**
>
> Four parameters change what you see elsewhere: *Manually upload files* (queue Upload buttons), *Enable successor processor* (successor fields), *Enable processor multithreading* (multithreading fields) and *Use keyvault* (Key Vault lookups on connectors). If a documented field is "missing", check these first.
