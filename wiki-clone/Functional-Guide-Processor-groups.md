<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Processor groups

A **Processor group** coordinates the execution of several processors as a set. The classic example: sales orders arriving in two files — one with the header and one with the lines — where the headers must be created *before* the lines.

| Field | Meaning |
| --- | --- |
| **Name** | A unique name for the processor group. |
| **Description** | A description for the group. |

On each member processor you then set:

-   **Group** — the group the processor belongs to.
-   **Order** — the sequence within the group (e.g. `1` headers, `2` lines).
-   **Run separately** — ensure members do not run simultaneously, so headers are always created before lines.

> **Tip: Scheduling a group**
>
> Schedule one batch for the whole group. When you run processors and choose a *Processor group*, all its members run in the defined order.
