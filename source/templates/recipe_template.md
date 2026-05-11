---
note: 0
ingredients: []
content: ""
view: false
tags:
---
<%*
const fill_in = await tp.system.suggester(["Oui", "Non"], [true, false], false, "Fill-in automatically ?");
let note = "";
let content = "";
let ingredients = [];
const file = await tp.file.find_tfile(tp.file.path(true));
const available_ingredients = await tp.app.vault.getFolderByPath("Ingredients").children.filter(x => x instanceof tp.obsidian.TFile).map(x => x.name);
if(fill_in){
    note = await tp.system.prompt("Note");
    content = await tp.system.prompt("Content", null, false, true);
}
%>
<%* tR = "" -%>
---
view: false
note: <% Number(note) || 0 %>
ingredients: {last_id: 0}
content: <% content %>
prep_duration: 0
cook_duration: 0
rest_duration: 0
oven: 0
source: ""
person:
  current: 1
  raw: 1
tags: []
cssclasses: global
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

