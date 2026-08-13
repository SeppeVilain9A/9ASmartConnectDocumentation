<!-- nav: Troubleshooting & FAQ | id: troubleshooting -->
# Troubleshooting & FAQ

> **Info: An export failed with an authentication error**
>
> The token may have expired. With *Use queue* enabled, the message stays in *Error* — fix the credential and reprocess it from the Queue form. Enabling *Use token cache* reduces token churn.

> **Warning: “Duplicate file” errors in Azure storage**
>
> Enable *Unique filename* on the processor so each file gets a unique name.

> **Info: I can't see information messages in the log**
>
> By default only errors are logged. Enable *Enable logging* in Parameters (or on the processor) to capture information messages while testing.

### Frequently asked questions

| Question | Answer |
| --- | --- |
| Why can't I change the Type / Direction on a processor? | Both are dictated by the selected data handler. Pick a different handler to change them. |
| Which content can go on the queue? | Only content serialisable to/from a string — XML, JSON, CSV and similar. |
| How do I make headers import before lines? | Put both processors in a group, set the Order, and enable *Run separately*. |
| Where do plain-text secrets go in production? | Into Azure Key Vault — enable *Use Azure Key Vault* in Parameters. |
| How do I stop the log/queue growing forever? | Schedule the *Clear logs* and *Cleanup queue* periodic jobs. |
| Which Azure storage type should I pick? | File share for users/folders, Container for automated high volume, Blob for large infrequent files. |

### Best practices

-   Use a queue for anything that can fail transiently (APIs, remote storage) so it can be retried safely.
-   Keep one connector per external endpoint and reuse it across processors.
-   Turn on telemetry for critical processors to monitor them in Application Insights.
-   Prefer SFTP over FTP, and always move to Key Vault before go-live.
-   Schedule the cleanup jobs from day one.
