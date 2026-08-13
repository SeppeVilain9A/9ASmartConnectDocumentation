<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Reporting (ER & SSRS)

### Electronic Reporting destination

When setting up Electronic Reporting destinations, Smart Connect adds an extra option to the destination settings called **9A Smart Connect**. Point it at a processor, and the ER output is processed according to that processor's setup.

Find it under *Electronic Reporting workspace > Related links > Electronic reporting destination*. Select the configuration and set:

-   **Process** — the processor that should handle the Electronic Report output.

### SSRS print destination settings

Similarly, when choosing the print destination of an SSRS report, Smart Connect adds an extra destination that routes the report to a processor — for example sending a PDF to Azure Storage when a customer invoice is posted. Configure it under the module's *Print management* setup:

| Field | Meaning |
| --- | --- |
| **Processor** | The processor that should handle the SSRS output. |
| **File format** | The format of the file to generate and send to the processor. |
