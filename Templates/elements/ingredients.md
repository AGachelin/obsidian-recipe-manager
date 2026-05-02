<%* 
const mb = this.app.plugins.plugins['obsidian-meta-bind-plugin'].api;
const bindTarget_ing = mb.parseBindTarget('ingredients', tp.config.target_file.path);
const ingredients = mb.getMetadata(bindTarget_ing);
for(id in ingredients){if(id!="last_id"){const name = ingredients[id]["name"];%>
```meta-bind-button
style: default
label: x
id: id-<%id%>
hidden: true
actions:
  - type: updateMetadata
    bindTarget: available_ingredients
    evaluate: true
    value: 'x==null?["<%name%>"]:["<%name%>",...x]'
  - type: updateMetadata
    bindTarget: ingredients
    evaluate: true
    value: (delete x["<%id%>"])?x:x
```
```meta-bind-button
style: default
id: ingredient-<%id%>
label: <% name %>
hidden: true
actions:
  - type: js
    file: 'Templates/Scripts/ingredients_input.js'
    args:
      id: <%id%>
```
<%*}}%>
<%*const [first, ...keys] = Object.keys(ingredients); keys.pop();if(first!="last_id"){const name = ingredients[first]["name"];%>| `BUTTON[ingredient-<%first%>]` | `INPUT[number:ingredients["<%first%>"]["amount"]]` | `INPUT[inlineSelect(option(-, unproductive), option(0, normal), option(+, productive)):ingredients["<%first%>"]["unit"]]` | `BUTTON[id-<%first%>]`|
<%*if(keys.length==0){%>| --- | --- | --- | --- |<%*}else {for(id of keys){console.log(id); const name = ingredients[id]["name"];%>| --- | --- | --- | --- |
| `BUTTON[ingredient-<%id%>]` | `INPUT[number:ingredients["<%id%>"]["amount"]]` | `INPUT[inlineSelect(option(-, unproductive), option(0, normal), option(+, productive)):ingredients["<%id%>"]["unit"]]` | `BUTTON[id-<%id%>]`|<%*}}}%>