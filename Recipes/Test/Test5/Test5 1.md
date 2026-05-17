---
view: true
note: 4
ingredients:
  "1":
    id: 1
    name: f.md
    amount: 2
    unit: ""
  "2":
    id: 2
    name: test.md
    amount:
    unit: ""
  last_id: 3
available_ingredients:
  - b.md
  - R.md
prep_duration: 900
cook_duration: 0
rest_duration: 40385
oven: 100
source: fezfrzfzrez
person:
  current: 1
  raw: 1
tags:
  - test5
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