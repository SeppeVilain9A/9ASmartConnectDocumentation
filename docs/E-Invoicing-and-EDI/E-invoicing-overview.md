<!-- nav: E-invoicing overview | id: einvoice -->
# E-invoicing overview

E-invoicing is the flagship use case of 9A Smart Connect. Two country solutions are documented here: **Belgium** (Peppol, via a certified middleware) and **France** (the MySupply / Chorus Pro distributor model).

Both share the same foundations — connectors, processors, handlers and the queue — and both archive documents into the **9A Raptor Document Warehouse (DWH)** so that every invoice, inbound or outbound, is traceable.

#### Belgium — Peppol — middleware · UBL

Invoices flow through a Peppol-certified middleware (e.g. Babelway). Inbound uses `NANHandlerInDMSUbl` / `…V2`; outbound uses Electronic Reporting (UBL Sales Invoice BE) sent to the *9A EDI* destination.

#### France — MySupply — distributor · InExchange

A distributor model with dedicated connectors (MySupply Out/In/Confirm), event-driven ER generation outbound and a period-transfer orchestrator inbound.

> **Info: Prerequisite packages**
>
> E-invoicing requires **9A Smart Connect**, **9A Smart Connect DMS** and **9A Raptor** to be installed in the D365 environment.
