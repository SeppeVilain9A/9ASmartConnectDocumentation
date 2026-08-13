<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Component architecture

Internally the framework is layered. A trigger enters through the orchestrator, which schedules a processor; the processor drives a handler and a connector; the queue and logging provide reliability and observability.

```mermaid
flowchart TB
    subgraph TR["Triggers"]
        A1["Run processors"]
        A2["Table event"]
        A3["ER / Print destination"]
    end
    subgraph ENG["Engine"]
        O["NANOrchestratorV2"]
        WD["NANProcessorWorkDispatcher"]
        P["NANProcessor (In / Out)"]
    end
    subgraph SHAPE["Data shaping"]
        H["NANHandler (In / Out)"]
    end
    subgraph TRANS["Transport"]
        C["NANConnecter (13 types)"]
    end
    subgraph REL["Reliability & audit"]
        Q[("NANQueueTable")]
        L[("NANProcessorLogTable")]
        T[("Telemetry / App Insights")]
    end
    A1 --> O
    A2 --> O
    A3 --> O
    O --> WD --> P
    O --> P
    P --> H --> C
    P --> Q
    P --> L
    P --> T
```
