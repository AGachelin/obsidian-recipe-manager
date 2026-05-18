---
view: true
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
    amount: 12
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
  raw: 4
tags:
  - "#example-note"
cssclasses:
  - recipe-ui
cool_duration: 57600
freeze_duration: 0
thumbnail: fond.jpg
---
```js-engine
return (await engine.importJs("source/src/lib/recipe-live.js")).setupRecipeLive(
    engine,
    context,
    container,
    component
);
```
