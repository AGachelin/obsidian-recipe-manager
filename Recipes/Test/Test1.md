---
note:
cook_duration: 0
rest_duration: 0
prep_duration: 0
oven:
view: true
ingredients:
  last_id: 1
content:
source: d
person:
  current: 5
  raw: 1
tags: []
cssclasses: recipe-ui
available_ingredients:
  - f.md
  - b.md
  - R.md
  - test.md
---
```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const comp = component;
const renderer = new (await engine.importJs("source/src/lib/recipe-renderer.js")).RecipeRenderer(context.file.path);

const bindTarget_view = mb.parseBindTarget('view', context.file.path);
const bindTarget_ing = mb.parseBindTarget('ingredients', context.file.path);
const bindTarget_person = mb.parseBindTarget('person.current', context.file.path);
const bindTarget_prep = mb.parseBindTarget('prep_duration', context.file.path);
const bindTarget_cook = mb.parseBindTarget('cook_duration', context.file.path);
const bindTarget_rest = mb.parseBindTarget('rest_duration', context.file.path);
const bindTarget_oven = mb.parseBindTarget('oven', context.file.path);
const bindTarget_note = mb.parseBindTarget('note', context.file.path);
const bindTarget_source = mb.parseBindTarget('source', context.file.path);
const bindTarget_tags = mb.parseBindTarget('tags', context.file.path);
const bindTarget_content = mb.parseBindTarget('content', context.file.path);
const bindTarget_person_raw = mb.parseBindTarget('person.raw', context.file.path);

function renderRecipe() {
    const viewValue = mb.getMetadata(bindTarget_view);
    const frontmatter = {
        view: viewValue === true || viewValue === "true",
        ingredients: mb.getMetadata(bindTarget_ing),
        person: {
            current: mb.getMetadata(bindTarget_person),
            raw: mb.getMetadata(bindTarget_person_raw),
        },
        prep_duration: mb.getMetadata(bindTarget_prep),
        cook_duration: mb.getMetadata(bindTarget_cook),
        rest_duration: mb.getMetadata(bindTarget_rest),
        oven: mb.getMetadata(bindTarget_oven),
        note: mb.getMetadata(bindTarget_note),
        source: mb.getMetadata(bindTarget_source),
        tags: mb.getMetadata(bindTarget_tags),
        content: mb.getMetadata(bindTarget_content),
    };
    renderer.render(mb, container, comp, frontmatter.view, frontmatter);
}

const reactive = engine.reactive(renderRecipe, mb.getMetadata(bindTarget_view));

const subscriptions = [
    mb.subscribeToMetadata(bindTarget_view, comp, () => reactive.refresh()),
    mb.subscribeToMetadata(bindTarget_ing, comp, () => reactive.refresh()),
    mb.subscribeToMetadata(bindTarget_person, comp, () => reactive.refresh()),
    mb.subscribeToMetadata(bindTarget_prep, comp, () => reactive.refresh()),
    mb.subscribeToMetadata(bindTarget_cook, comp, () => reactive.refresh()),
    mb.subscribeToMetadata(bindTarget_rest, comp, () => reactive.refresh()),
    mb.subscribeToMetadata(bindTarget_oven, comp, () => reactive.refresh()),
    mb.subscribeToMetadata(bindTarget_note, comp, () => reactive.refresh()),
    mb.subscribeToMetadata(bindTarget_source, comp, () => reactive.refresh()),
    mb.subscribeToMetadata(bindTarget_tags, comp, () => reactive.refresh()),
    mb.subscribeToMetadata(bindTarget_content, comp, () => reactive.refresh()),
    mb.subscribeToMetadata(bindTarget_person_raw, comp, () => reactive.refresh()),
];

return reactive;
```
