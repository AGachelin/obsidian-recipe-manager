---
view: false
note: 4
ingredients:
  "1":
    id: 1
    name: R.md
    amount: 4
    unit: sachet
  last_id: 1
content:
available_ingredients:
  - b.md
  - f.md
  - test.md
rest: 900
cook: 7200
source: vfre
oven:
prep: 0
person:
  current: 1
  raw: 1
tags: []
cssclasses: global
---
```meta-bind-button
label: View
id: "switch-mode-view"
hidden: true
style: default
class: edit
actions:
  - type: updateMetadata
    bindTarget: view
    evaluate: false
    value: true
```
```meta-bind-button
label: Edit
id: "switch-mode-edit"
hidden: true
style: default
class: edit
actions:
  - type: updateMetadata
    bindTarget: view
    evaluate: false
    value: false
```
```meta-bind-js-view
{view} as view
---
if(context.bound.view){return engine.markdown.create("`BUTTON[switch-mode-edit]`");}
else{return engine.markdown.create("`BUTTON[switch-mode-view]`");}
```
```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const comp = new obsidian.Component(component);
component.addChild(comp);
const bindTargetView = mb.parseBindTarget('view', context.file.path);
const bindTargetTags = mb.parseBindTarget('tags', context.file.path);
function render(view){
	comp.unload();
	comp.load();
	container.empty();
	container.createEl('div')
	if(!view){
		const multiSelectConfig = {
			inputFieldType: "inlineListSuggester",
			bindTarget: mb.createBindTarget('frontmatter', context.file.path, ['tags']),
		    arguments:
		    Object.keys(mb.mb.app.metadataCache.getTags()).map(x => {
		        return {
		            name: 'option',
		            value: [x.toString()],
		        };
		    }).concat([{name:"allowOther", value:["true"]}])
		};
		const multiSelectOptions = {
		    declaration: multiSelectConfig,
		    renderChildType: 'inline'
		};
		const MultiSelect = mb.createInputFieldMountable(context.file.path, multiSelectOptions);
		mb.wrapInMDRC(MultiSelect, container, comp);
	}
}
const reactive = engine.reactive(render, mb.getMetadata(bindTargetView));
const subscription = mb.subscribeToMetadata(
	bindTargetView,
	component,
	(value) => reactive.refresh(value)
);
const subscription2 = mb.subscribeToMetadata(
	bindTargetTags,
	component,
	(value) => {mb.updateMetadata(bindTargetTags, array=> [...new Set(array.map(val=> val[0]=="#"?val:"#"+val))]);reactive.refresh(mb.getMetadata(bindTargetView))}
);
return reactive;
```


```js-engine
const mb_plugin = engine.getPlugin('obsidian-meta-bind-plugin');
const mb = mb_plugin.api;
const comp = new obsidian.Component(component);
const bindTarget_view = mb.parseBindTarget('view', context.file.path);
const bindTarget_ing = mb.parseBindTarget('available_ingredients', context.file.path);
const templateFile = 'Templates/elements/ingredients.md'
async function addIngredient(view){
	if(view){
		container.empty();
		return;
	}
	const ing_to_add = await mb_plugin.mb.internal.evaluateTemplaterTemplate(templateFile, context.file.path);
	return engine.markdown.create(ing_to_add);
}
const reactive_ing = engine.reactive(addIngredient, mb.getMetadata(bindTarget_ing));
const subscription_view = mb.subscribeToMetadata(
	bindTarget_view,
	component,
	(value) => reactive_ing.refresh(value)
);
const subscription_ing = mb.subscribeToMetadata(
	bindTarget_ing,
	component,
	(value) => reactive_ing.refresh(mb.getMetadata(bindTarget_view))
);

return reactive_ing;
```
```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const comp = new obsidian.Component(component);
component.addChild(comp);
const bindTargetView = mb.parseBindTarget('view', context.file.path);
function render(view){
	comp.unload();
    comp.load();
    container.empty();
    if(!view){
	    const NewButtonConfig = {
			id: 'new-ingredient',
			style: 'default',
			label: 'new ingredient',
			hidden: true,
			action:
			{type: 'templaterCreateNote',
			templateFile: 'Templates/ingredient_template.md',
			folderPath: 'Ingredients',
			fileName: 'ing'}
		};
		const AddButtonConfig = {
			id: 'add-ingredient',
			style: 'default',
			label: 'add ingredient',
			hidden: false,
			action:
			{type: 'js',
			file: 'Templates/Scripts/ingredients_input.js'}
		}
		const AddButtonOptions = {
		    declaration: AddButtonConfig,
		    isPreview: false
		};
		const NewButtonOptions = {
		    declaration: NewButtonConfig,
		    isPreview: false
		};
		const AddButton = mb.createButtonMountable(context.file.path, AddButtonOptions);
		const NewButton = mb.createButtonMountable(context.file.path, NewButtonOptions);
		const ButtonGroup = mb.createButtonGroupMountable(context.file.path, {
		declaration: {referencedButtonIds:['add-ingredient','new-ingredient']},
		renderChildType:'inline',
		})
		mb.wrapInMDRC(NewButton, container, comp);
		mb.wrapInMDRC(AddButton, container, comp);
		mb.wrapInMDRC(ButtonGroup, container, comp);
		
	}
}
const reactive = engine.reactive(render, mb.getMetadata(bindTargetView));
const subscription = mb.subscribeToMetadata(
	bindTargetView,
	component,
	(value) => reactive.refresh(value)
);

return reactive;
```
```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const internal = engine.getPlugin('obsidian-meta-bind-plugin').mb.internal;
const comp = new obsidian.Component(component);
let builder = engine.markdown.createBuilder();
component.addChild(comp);
const bindTargetView = mb.parseBindTarget('view', context.file.path);
const bindTargetPerson = mb.parseBindTarget('person', context.file.path);
function render(view){
	comp.unload();
	comp.load();
	container.empty();
	const div = container.createEl('div', {cls:'same_row'})
	const span1 = div.createEl('span');
	const span2 = div.createEl('span');
	const span3 = container.createEl('span');
	container.createEl('br');
	if(view){
	    const person = mb.getMetadata(bindTargetPerson);
	    const IncButtonConfig = {
			label: "+1",
			hidden: true,
			id: "count-increment",
			style: "default",
			action:{
			    type: "updateMetadata",
			    bindTarget: "person.current",
			    evaluate: true,
			    value: "x + 1"
			}
		};
		const DecButtonConfig = {
			label: "-1",
			hidden: true,
			id: "count-decrement",
			style: "default",
			action:{
			    type: "updateMetadata",
			    bindTarget: "person.current",
			    evaluate: true,
			    value: "Math.max(0, x - 1)"
			}
		};
		const ResetButtonConfig = {
			label: "Reset",
			hidden: true,
			id: "count-reset",
			style: "default",
			action:{
			    type: "updateMetadata",
			    bindTarget: "person.current",
			    evaluate: true,
			    value: person.raw
			}
		};
		const IncButtonOptions = {
		    declaration: IncButtonConfig,
		    isPreview: false
		};
		const DecButtonOptions = {
		    declaration: DecButtonConfig,
		    isPreview: false
		};
		const ResetButtonOptions = {
		    declaration: ResetButtonConfig,
		    isPreview: false
		};
		
		const IncButton = mb.createButtonMountable(context.file.path, IncButtonOptions);
		const DecButton = mb.createButtonMountable(context.file.path, DecButtonOptions);
		const ResetButton = mb.createButtonMountable(context.file.path, ResetButtonOptions);
		mb.wrapInMDRC(IncButton, span3, comp);
		mb.wrapInMDRC(DecButton, span3, comp);
		mb.wrapInMDRC(ResetButton, span3, comp);
		const ButtonGroup = mb.createButtonGroupMountable(context.file.path, {
		declaration: {referencedButtonIds:['count-decrement', 'count-reset','count-increment']},
		renderChildType:'inline',
		});
		mb.wrapInMDRC(ButtonGroup, span2, comp);
		internal.renderMarkdown("`VIEW[{person.current} personnes][text]`", span1, context.file.path);
	}
}
const reactive = engine.reactive(render, mb.getMetadata(bindTargetView));
const subscription = mb.subscribeToMetadata(
	bindTargetView,
	component,
	(value) => reactive.refresh(value)
);

return reactive;
```
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
            recipeRenderer.default.createViewFields(frontmatter),
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
