<%* const id = tp.config.target_file.basename%>
```meta-bind-button
style: default
label: x
id: <%id%>
hidden: true
actions:
  - type: regexpReplaceInNote
    regexp: "```meta-bind-button\nstyle: default\nlabel: x\nid: <%id%>\n[\\s\\S]*?BUTTON\\[<%id%>\\]`"
    replacement: ""
```
```meta-bind-button
style: default
label: add ingredient
id: ingredient-<% id %>
hidden: true
actions:
  - type: updateMetadata
    bindTarget: note
    evaluate: false
    value: 0
```
`BUTTON[ingredient-<%id%>]` | `INPUT[number:ingredients[1][amount]]` | `INPUT[inlineSelect(option(-, unproductive), option(0, normal), option(+, productive)):ingredients[1][unit]]` | `BUTTON[<%id%>]`