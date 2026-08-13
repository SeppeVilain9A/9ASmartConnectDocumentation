<!-- nav: Overview & design | id: overview -->
# Overview & design

Smart Connect is built on the D365 F&O platform and harnesses a suite of standard functions for seamless integration with external systems. This lets you integrate through many protocols while re-using proven platform capabilities:

#### Data Management Framework — import & export entities

Move data in and out using DMF definition groups for any standard or custom data entity.

#### Electronic Reporting — format-driven output

Send ER-generated documents to an external destination through a processor.

#### Print destinations — report output

Route printed reports (e.g. a posted invoice PDF) to cloud storage or an API.

#### Custom logic — extend with X++

Write your own data handlers for scenarios not covered out of the box.

The design is structured around **processes built from re-usable blocks**. This methodology constructs a resilient and efficient business flow that ensures the smooth transfer of information — inbound and outbound.

> **Tip: The mental model**
>
> A **Connector** answers *“how do I connect?”*, a **Data handler** answers *“what shape is the data?”*, and a **Processor** ties them together and answers *“what should happen, and when?”*. The optional **Queue** makes it reliable.
