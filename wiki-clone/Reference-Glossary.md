<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Glossary

| Term | Definition |
| --- | --- |
| **Connector** | A saved connection to an external application, reusable by many processors. |
| **Processor** | A single integration process: data handler + connector + trigger + direction. |
| **Data handler** | The class that shapes the payload; its name encodes the direction (e.g. `NANHandlerOutER`). |
| **Processor group** | An ordered set of processors that must run together. |
| **Variable** | A handler-defined setting completed per processor (e.g. *Directory*). |
| **Queue** | A reliable buffer of messages that can be retried on failure. |
| **Event** | An asynchronous record that something must be processed later. |
| **Go / no-go** | A flag a handler sets to *true* only when there is data to process. |
| **DMF** | Data Management Framework — the standard D365 import/export engine. |
| **ER** | Electronic Reporting — configurable, format-driven document generation. |
| **AS2** | Applicability Statement 2 — a secure EDI-over-internet protocol. |
| **UBL** | Universal Business Language — a standard XML format for business documents. |
| **Peppol** | A pan-European framework and network for standardised e-invoicing. |
| **ISO 20022** | The international standard for financial messages (PAIN payments, CAMT statements). |
| **SAS** | Shared Access Signature — a scoped, time-limited Azure Storage token. |
| **Telemetry** | Operational metrics sent to Application Insights. |
