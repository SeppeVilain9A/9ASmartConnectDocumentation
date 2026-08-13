<!-- Generated from /docs by build/publish-wiki.mjs — edit there, not here. -->
# Security roles

Smart Connect ships two roles built from duties and privileges. Grant *Maintain* to functional administrators and *View* to users who only need to monitor.

| Role | Duty | Privileges | Access |
| --- | --- | --- | --- |
| **9A Smart Connect maintain**
`NANRoleMaintain` | `NANDutyMaintain` | `NANPrivilegeMaintain`, `NANEntitiesMaintain` | Create, read, update, delete on all Smart Connect forms and data entities. |
| **9A Smart Connect view**
`NANRoleView` | `NANDutyView` | `NANPrivilegeView`, `NANEntitiesView` | Read-only access to connectors, processors, queue, events and logs. |
