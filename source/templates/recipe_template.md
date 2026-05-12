<%*
const fill_in = await tp.system.suggester(["Oui", "Non"], [true, false], false, "Fill-in automatically ?");
let note = "";
let content = "";
if (fill_in) {
    note = await tp.system.prompt("Note");
    content = await tp.system.prompt("Content", null, false, true);
}
%>
<%* tR = "" -%>
---
view: false
note: <% Number(note) || 0 %>
ingredients: {last_id: 0}
available_ingredients: []
prep_duration: 0
cook_duration: 0
rest_duration: 0
oven: 0
source: ""
person:
  current: 1
  raw: 1
tags: []
cssclasses:
  - recipe-ui
---
```js-engine
return (await engine.importJs("source/src/lib/recipe-live.js")).setupRecipeLive(
    engine,
    context,
    container,
    component
);
```