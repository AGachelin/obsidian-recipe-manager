---
view: false
note: 0
ingredients:
  "4":
    id: 4
    name: test.md
    amount:
    unit: milligram
  "5":
    id: 5
    name: R.md
    amount:
    unit: ""
  "6":
    id: 6
    name: b.md
    amount:
    unit: sachet
  last_id: 6
available_ingredients:
  - f.md
prep_duration: 1980
cook_duration: 0
rest_duration: 0
oven:
source: " njk hji "
person:
  current: 1
  raw: 1
tags:
  - "#example-note"
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
