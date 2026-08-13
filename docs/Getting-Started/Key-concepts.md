<!-- nav: Key concepts | id: concepts -->
# Key concepts

These terms appear throughout the manual and on screen. They are summarised here and expanded in the [Glossary](../reference/glossary.md).

#### Connector

A saved connection to an external application (Azure, API, SFTP, AS2 …). Reusable across processors.

#### Processor

A single integration process: a data handler + a connector + a trigger type + a direction.

#### Data handler

The class that shapes the payload. Its name encodes the direction, e.g. `NANHandlerOutER`.

#### Processor group

An ordered set of processors that must run together, e.g. order headers before order lines.

#### Variable

Handler-defined settings (e.g. *Directory*) that you fill in per processor.

#### Queue

A reliable buffer of messages that can be retried when a send or import fails.

#### Event

An asynchronous record noting that “something happened” and must be processed later.

#### Go / No-go

A flag a handler sets to *true* only when there is genuinely data to send/import.
