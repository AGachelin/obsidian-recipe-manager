<%* const dv = this.app.plugins.plugins["dataview"].api; const id_file = await dv.page(tp.config.target_file.path); console.log(id_file); const id = id_file.ingredients[id_file.ingredients.length-1]["id"]; const name = id_file.ingredients[id_file.ingredients.length-1]["name"];// fix with correct id
%>
<%* tR = "" -%>
```meta-bind-button
style: default
label: x
id: id-<%id%>
hidden: true
actions:
  - type: updateMetadata
    bindTarget: ingredients
    evaluate: true
    value: x.filter((ing)=>ing.id!=<%id%>)
  - type: regexpReplaceInNote
    regexp: "```meta-bind-button\nstyle: default\nlabel: x\nid: id-<%id%>\n[\\s\\S]*?BUTTON\\[id-<%id%>\\]`\n\n"
    replacement: ""
```
```meta-bind-button
style: default
id: ingredient-<%id%>
label: <% name ? name : "select an ingredient" %>
hidden: true
actions:
  - type: updateMetadata
    bindTarget: note
    evaluate: false
    value: 0
```
`BUTTON[ingredient-<%id%>]` | `INPUT[number:ingredients[<%id%>].amount]` | `INPUT[inlineSelect(option(-, unproductive), option(0, normal), option(+, productive)):ingredients[<%id%>].unit]` | `BUTTON[id-<%id%>]`
