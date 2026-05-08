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
    // ingredients = await tp.user.
    content = await tp.system.prompt("Content", null, false, true);
}
%>
<%* tR = "" -%>
---
view: false
note: <% note %>
ingredients: {last_id: 0}
content: <% content %>
available_ingredients: <%available_ingredients.map(ing => `\n- ${ing}`)%>
rest: 0
cook: 0
source:
oven:
prep: 0
person:
  current: 0
  raw: 1
tags:
cssclasses: global
---
<% await tp.file.include(tp.file.find_tfile("toggle-button")) %>
<% await tp.file.include(tp.file.find_tfile("tags")) %>
<% await tp.file.include(tp.file.find_tfile("ingredient-table"))%>
<% await tp.file.include(tp.file.find_tfile("add-ingredient-button")) %>
<% await tp.file.include(tp.file.find_tfile("person-button")) %>
```js-engine
// Import modularized utilities and business logic
const durationUtils = await engine.importJs("Templates/Scripts/utils/duration.js");
const ingredientsView = await engine.importJs("Templates/Scripts/lib/ingredients-view.js");
const recipeRenderer = await engine.importJs("Templates/Scripts/lib/recipe-renderer.js");

// Get plugin APIs
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
let frontmatter = context.metadata.frontmatter;

// Create input fields
const inputs = recipeRenderer.default.createInputFields(frontmatter, mb);
const views = recipeRenderer.default.createViewFields(frontmatter);

// Create duration inputs and views
const durations = ['cook', 'rest', 'prep'];
const durationInputs = {};
const durationViews = {};
const bindTargetView = mb.parseBindTarget('view', context.file.path);

// Render based on view mode
function render(isViewMode) {
	frontmatter = context.metadata.frontmatter;
	durations.forEach(duration => {
    const splitTimes = mb.mb.math.splitTime(frontmatter[duration], true);
    const { input, view } = durationUtils.default.createDurationInput(duration, splitTimes, mb);
    durationInputs[duration] = input;
    durationViews[duration] = view;
});
	const ingredientsMarkdown = ingredientsView.default.viewIngredients(frontmatter.ingredients);
    return engine.markdown.create(
        recipeRenderer.default.renderRecipe(
            isViewMode,
            inputs,
            views,
            ingredientsMarkdown,
            durationViews,
            durationInputs
        )
    );
}

const reactive = engine.reactive(render, mb.getMetadata(bindTargetView));
const subscription = mb.subscribeToMetadata(
	bindTargetView,
	component,
	(value) => reactive.refresh(value)
);

return reactive;
```

