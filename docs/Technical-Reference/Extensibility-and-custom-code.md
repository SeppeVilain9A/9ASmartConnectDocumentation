<!-- nav: Extensibility & custom code | id: extensibility -->
# Extensibility & custom code

When a standard data handler does not cover your scenario, write a custom one. Outbound handlers extend `NANHandlerOut`; inbound handlers extend `NANHandlerIn`.

### Custom outbound handler

1.  Extend `NANHandlerOut` and give the class a name for the setup lookup.
2.  Declare variables as local `parm` properties; strip the `parm` prefix when reading their values (the setup shows them without the prefix).
3.  Specify the integration *type* (Direct, Event or Periodic).
4.  Implement `process()`: set `goNoGo = true` only when there is data to export.
5.  Provide the file name (and any sub-directory) through the appropriate methods.

Custom outbound handler (illustrative X++)X++

```
[NANHandlerAttribute]
public class MyHandlerOutCustomExport extends NANHandlerOut
{
    // 1. Variables exposed to the processor setup (prefix 'parm')
    private str parmDirectory;

    // 2. Name shown in the Data handler lookup
    public str className()          { return "Custom export - my entity"; }

    // 3. Trigger type & direction
    public NANProcessType type()    { return NANProcessType::Periodic; }

    // 4. Assign variables (note: NO 'parm' prefix in the case label)
    public void assignValue(str _name, str _value)
    {
        switch (_name)
        {
            case 'Directory': parmDirectory = _value; break;
        }
    }

    // 5. Main method - set goNoGo only when there is data
    public boolean process()
    {
        MyTable rec;
        select firstOnly rec where rec.Exported == NoYes::No;
        if (rec)
        {
            this.getPayload().setContent(this.buildXml(rec));
            this.goNoGo = true;   // there IS data -> proceed
        }
        return this.goNoGo;
    }
}
```

### Custom inbound handler

Inbound handlers follow the same pattern for variables, class name and type. Put the import logic in `process()`, verify that there is data to process, and set `goNoGo = true` on success so the framework completes all cascading steps.

Custom inbound handler (illustrative X++)X++

```
[NANHandlerAttribute]
public class MyHandlerInCustomImport extends NANHandlerIn
{
    private str parmSuccessDir;
    private str parmFailureDir;

    public str className()       { return "Custom import - my entity"; }
    public NANProcessType type() { return NANProcessType::Periodic; }

    public boolean process()
    {
        str content = this.getPayload().getContent();
        if (content)
        {
            this.importFromXml(content);   // your logic
            this.goNoGo = true;            // success -> move to success folder
        }
        return this.goNoGo;
    }
}
```

> **Tip: Success / failure folders**
>
> For file-share imports, define two variables (success and failure directories). When `goNoGo` is *true* the file is moved to the success folder; otherwise to the failure folder.

> **Warning: Code is illustrative**
>
> The snippets show the framework's patterns (variable stripping, `type()`, `className()`, go/no-go). Confirm exact method signatures against the version of the framework in your environment before implementing.
