---
view: false
note:
ingredients:
  last_id: 0
available_ingredients: []
prep_duration: 0
cook_duration: 364
rest_duration: 18
oven:
source: nf
person:
  current: 3
  raw: 1
tags: []
content: ""
cssclasses:
  - global
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
