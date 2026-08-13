<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Setup & parameters

Several elements are configured once and apply across processes.

### Parameters

| Parameter | What it does |
| --- | --- |
| **Maximum retries** | The retry limit for processing a message before it is abandoned. |
| **Override event deletion** | By default, successfully processed events are deleted. Enable this (e.g. during testing) to keep them. |
| **Use Azure Key Vault** | Switch credential fields (Client ID, Secret …) from plain-text entry to selections from the standard D365 F&O Key Vault setup. Recommended for production. |
| **Full global error** | When *No*, only the error message is shown; when *Yes*, the full stack trace is displayed. |
| **VAT / registration number search option** | Search by VAT number, by registration number, or both. |
| **Enable logging** | By default only errors are logged; enable this to log all processors (useful when testing). |
| **Log connector** | Write log files to an external application (e.g. Azure storage) using an existing connector. |

> **Warning: Key Vault before go-live**
>
> Plain-text secrets are acceptable only in non-production scenarios (e.g. early in a project before Key Vault exists). Once Key Vault is available, enable *Use Azure Key Vault* and move the secrets across.

![9A Smart Connect Parameters form](attachments/12_parameters.png)

*The Parameters form. Global behaviour for the whole module — maximum retries, logging, Key Vault, credential encryption and more.*

> **Info: Parameters that unlock fields elsewhere**
>
> Several parameters are master switches — *Manually upload files*, *Enable successor processor*, *Enable processor multithreading* and *Use keyvault*. For every parameter and what each one reveals, see [Global parameters — complete reference](Field-and-Parameter-Reference-Global-parameters).

### Process configuration

Process configuration links specific customers/vendors — or customer/vendor groups — to processors, so different partners can use different processes.

| Field | Meaning |
| --- | --- |
| **Relation type** | Customer, Vendor, Customer group or Vendor group. |
| **Relation number** | The specific record to form the relationship with, based on the relation type. |
| **Processor Id** | The processor to link to the relation. |

### Attributes

Attributes let you attach custom key/value metadata to specific connectors and processors. Both the attribute name and its value are defined manually — a lightweight extensibility point for scenarios that need extra configuration.

### Placeholders

Placeholders are a general-purpose mechanism that extracts values from a message with a regular expression. They have their own section — see [Placeholders](Functional-Guide-Placeholders).
