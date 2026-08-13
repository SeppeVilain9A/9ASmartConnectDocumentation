<!-- nav: Placeholders | id: placeholders -->
# Placeholders (regex value extraction)

A **Placeholder** is a named regular expression that runs against a field of a queue message (usually the *Payload*) and stores the captured text under a reusable token. It is a *general* mechanism used across the whole framework — for example to supply the lookup value on a [Raptor](../add-on-modules/dms-document-capture.md) mapping, or to lift a reference out of an inbound file onto the queue record.

Maintain placeholders under *Setup > Placeholders*.

| Where | Field | Meaning |
| --- | --- | --- |
| **Header** | Placeholder | The token, e.g. `%InvoiceIdMYSUPPLY%` — what you reference in templates. |
| Description | Free-text description. |
| **Line** | Reference field name | The queue field the regex runs against (e.g. `Payload`). |
| Regex | The .NET regular expression; the matched text becomes the value. |

![Placeholders form with a regex that extracts the invoice id from the payload](/.attachments/21_placeholders.png)

*Placeholders. The %InvoiceIdMYSUPPLY% placeholder runs a regex on the Payload line to pull the invoice id out of the XML. Use Validate input to test a pattern before saving.*

How it works: `NANPlaceholderLine.getValueFromPlaceholder()` compiles the *Regex* and runs `regex.Match(value)`, returning the matched text. `NANHelper::PlaceholdersGetMap()` builds a map of every placeholder → its extracted value for a record, and `NANHelper::PlaceholdersExpandString()` substitutes those tokens inside a template string.

> **Tip: Reading the example regex**
>
> `(?<=<InvoiceId>)[^<]+(?=</InvoiceId>)` captures the text *between* the XML tags: `(?<=<InvoiceId>)` is a look-behind (must be preceded by `<InvoiceId>`), `[^<]+` grabs everything up to the next `<`, and `(?=</InvoiceId>)` is a look-ahead (must be followed by `</InvoiceId>`) — so only the id value is returned, tags excluded.
