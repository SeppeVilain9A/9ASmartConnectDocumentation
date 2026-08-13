<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Handler catalogue

The **data handler** is the heart of a processor — it decides what the data is and which D365 components are involved. This catalogue documents each supported (out-of-the-box) handler: what it does, its direction and trigger, the connector(s) it works with, the components it uses, and its setup variables.

> **Info: How to read a handler**
>
> Each entry shows a *flow chain*: the source component → the handler → the components it drives → the transport. Handlers marked “no connector” do the transport themselves (e.g. DMF, archiving) or hand a payload to the processor's connector.
