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
<%*const unit_options = ["gram", "kilogram", "milligram", "sachet", "ounce", "poundmass", "litre", "decilitre", "centilitre", "millilitre", "teaspoon", "tablespoon", "fluidounce", "cup", "quart", "gallon", "drop", "pinch"];const unit_display_options = ["g", "kg", "mg", "sachet", "oz", "lb", "L", "dL", "cL", "mL", "tsp", "tbsp", "floz", "cp", "qt", "gal", "goutte", "pincée"];const options=[...unit_options.keys()].map(i => `option(${unit_options[i]}, ${unit_display_options[i]})`).join(', '); const [first, ...keys] = Object.keys(ingredients); keys.pop();if(first!="last_id"){const name = ingredients[first]["name"];%>| `BUTTON[ingredient-<%first%>]` | `INPUT[number(defaultValue("<%ingredients[first]['amount']%>")):memory^ingredients["<%first%>"]["amount"]]` `VIEW[bind(convert({ingredients["<%first%>"]["unit"]}, {memory^ingredients["<%first%>"]["amount"]}, {ingredients["<%first%>"]["name"]}), 0, null)][math(hidden):ingredients["<%first%>"]["amount"]]` | `INPUT[inlineSelect(option(''),<%options%>):ingredients["<%first%>"]["unit"]]` | `BUTTON[id-<%first%>]`|
<%*if(keys.length==0){%>| --- | --- | --- | --- |<%*}else {for(id of keys){ const name = ingredients[id]["name"];%>| --- | --- | --- | --- |
| `BUTTON[ingredient-<%id%>]` | `INPUT[number(defaultValue("<%ingredients[first]['amount']%>")):memory^ingredients["<%id%>"]["amount"]]`  `VIEW[bind(convert({ingredients["<%id%>"]["unit"]}, {memory^ingredients["<%id%>"]["amount"]}, {ingredients["<%id%>"]["name"]}), 0, null)][math(hidden):ingredients["<%id%>"]["amount"]]` | `INPUT[inlineSelect(<%options%>):ingredients["<%id%>"]["unit"]]` | `BUTTON[id-<%id%>]`|<%*}}}%>