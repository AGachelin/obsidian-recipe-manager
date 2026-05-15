---
cssclasses:
  - recipe-ui
filter_note_min: 0
filter_note_max: 5
filter_prep_max_sec: 604800
filter_cook_max_sec: 604800
filter_rest_max_sec: 604800
filter_source_substr: ""
filter_tags: []
filter_ingredients_state: {}
filter_ingredients_amount: {}
filter_ingredients_unit: {}
---

```js-engine
return (await engine.importJs("source/src/lib/frontpage-live.js")).setupFrontpageLive(
    engine,
    context,
    container,
    component
);
```