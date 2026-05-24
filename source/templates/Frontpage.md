---
cssclasses:
  - frontpage-ui
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
filter_ingredients_search: ""
filter_cool_max_sec: 604800
filter_freeze_max_sec: 604800
note: 0
cook_duration: 0
rest_duration: 0
prep_duration: 0
cool_duration: 0
freeze_duration: 0
oven:
---

```js-engine
return (await engine.importJs("source/src/lib/frontpage-live.js")).setupFrontpageLive(
    engine,
    context,
    container,
    component
);
```