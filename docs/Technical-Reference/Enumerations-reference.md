<!-- nav: Enumerations reference | id: enums -->
# Enumerations reference

| Enum | Elements |
| --- | --- |
| `NANConnecterType` | Url, Api, Blob, FileShare, Container, FTP, SFTP, AS2, Kofax (Tungsten), BabelwaySoap, UI, SharePoint, Attachment |
| `NANAuthType` | Basic, Azure, OAuth, APIKey, Audience, BearerToken |
| `NANStorageAuthType` | SasCredential, ConnectionString, SharedKeyCredential |
| `NANContentType` | String, Stream, ByteArray, FormUrlEncoded, SysUrlEncoded, FormDataFileStream |
| `NANMediaType` | AppXml, AppJson, AppFormUrlEncoded |
| `NANCertificatePurpose` | Authentication, Signing, Encryption |
| `NANProcessType` | Event, Direct, Periodic, PeriodicMulti, PeriodicTransfer |
| `NANProcessDirection` | Inbound, Outbound |
| `NANBusinessProcess` | None, SalesOrderConfirm, PackingSlipCreate, SalesInvoiceCreate, PurchOrderConfirm, ParentProcessor, BusinessDocumentApplicationResponse |
| `NANInvoiceType` | SalesInvoice, SalesCreditNote, FreetextInvoice, FreeTextCreditNote, ProjectInvoice, ProjectCreditNote |
| `NANQueueStatus` | Pending, Processed, Error, Cancelled |
| `NANEventType` | None, Insert, Update, Delete |
| `NANEventStatus` | Waiting, Sent, Error |
| `NANProcessorWorkStatus` | ToBeProcessed, InProcessing, RetryWaiting, Failed |
| `NANProcessorWorkSourceType` | Event, Queue |
| `NANLogLevel` | Info, Error |
| `NANCustVendRelType` | Cust, CustGroup, Vend, VendGroup |
