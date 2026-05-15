---
view: false
note: 0
ingredients:
  "1":
    id: 1
    name: f.md
    amount: 20
    unit: ""
  last_id: 1
available_ingredients:
  - b.md
  - R.md
  - test.md
prep_duration: 0
cook_duration: 0
rest_duration: 0
oven:
source: ""
person:
  current: 1
  raw: 1
tags:
  - "#test"
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