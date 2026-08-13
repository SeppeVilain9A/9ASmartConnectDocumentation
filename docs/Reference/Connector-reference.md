<!-- nav: Connector reference | id: connector-reference -->
# Connector reference

A consolidated view of every connector: transport, supported directions, authentication and typical use.

| Connector | Class | Transport | Dir. | Authentication | Typical use |
| --- | --- | --- | --- | --- | --- |
| **API** | `NANConnecterAPI` | REST / HTTP | `both` | Basic, OAuth, Azure, API key, Bearer | JSON/XML web APIs (orders, master data). |
| **AS2** | `NANConnecterAS2` | AS2 / HTTP | out | Certificates (sign + encrypt) | Secure EDI with non-repudiation. |
| **Azure Blob** | `NANConnecterBlob` | Azure Blob | `both` | SAS / Connection string / Shared key | Large, infrequent files. |
| **Azure File share** | `NANConnecterFileShare` | Azure Files | `both` | SAS / Connection string / Shared key | Multi-level folders, manual handling. |
| **Azure Container** | `NANConnecterContainer` | Azure Blob container | `both` | SAS / Connection string / Shared key | Automated, high-volume small files. |
| **FTP** | `NANConnecterFTP` | FTP | `both` | Username / password, optional SSL | Legacy batch file exchange. |
| **SFTP** | `NANConnecterSFTP` | SFTP | `both` | Username / password or certificate | Secure file transfer. |
| **SharePoint** | `NANConnecterSharePoint` | Microsoft Graph | `both` | OAuth (Graph) | Document libraries. |
| **URL** | `NANConnecterUrl` | HTTP download | out | — | Fetch a web resource. |
| **Tungsten / Kofax** | `NANConnecterKofax` | Kofax API | `both` | API key + credentials | Invoice & vendor-bank capture. |
| **Babelway SOAP** | `NANConnecterBabelwaySoap` | SOAP | in | Username / password | Babelway-managed messages. |
| **Attachment** | `NANConnecterAttachment` | Document Mgmt | out | — | Attach file to a D365 record. |
| **User interface** | `NANConnecterUI` | Manual | `both` | — | Ad-hoc upload / download. |
