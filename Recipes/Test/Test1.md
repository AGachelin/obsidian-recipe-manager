---
view: false
note: 4
ingredients:
  "51":
    id: 51
    name: a.md
    amount: 0
    unit: ""
  "52":
    id: 52
    name: test.md
    amount: 0
    unit: ""
  last_id: 52
content: vfzvtrzebtre
available_ingredients:
  - b.md
---
```meta-bind-button
label: View
id: "switch-mode-view"
hidden: true
style: default
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
const mb_plugin = engine.getPlugin('obsidian-meta-bind-plugin');
const mb = mb_plugin.api;
const comp = new obsidian.Component(component);
const bindTarget_view = mb.parseBindTarget('view', context.file.path);
const bindTarget_ing = mb.parseBindTarget('available_ingredients', context.file.path);
const templateFile = 'Templates/elements/ingredients.md'
async function addIngredient(){
	const ing_to_add = await mb_plugin.mb.internal.evaluateTemplaterTemplate(templateFile, context.file.path);
	return engine.markdown.create(ing_to_add);
}
function render(view){
	comp.unload();
	comp.load();
	container.empty();
	if(view){
		return;
	}
}
const reactive_view = engine.reactive(render, mb.getMetadata(bindTarget_view));
const reactive_ing = engine.reactive(addIngredient, mb.getMetadata(bindTarget_ing));
const subscription_view = mb.subscribeToMetadata(
	bindTarget_view,
	component,
	(value) => reactive_view.refresh(value)
);
const subscription_ing = mb.subscribeToMetadata(
	bindTarget_ing,
	component,
	(value) => reactive_ing.refresh()
);

return reactive_view, reactive_ing;
```

```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const buttonConfig = {
	id: 'add-ingredient',
	style: 'default',
	label: 'add ingredient',
	hidden: false,
	action:
	{type: 'js',
	file: 'Templates/Scripts/ingredients_input.js'
}
}
const buttonOptions = {
    declaration: buttonConfig,
    isPreview: false
};
const button = mb.createButtonMountable(context.file.path, buttonOptions);
mb.wrapInMDRC(button, container, component);
```
```meta-bind-js-view
{view} as view
---
// get current view : this.app.workspace.activeLeaf.view.currentMode.type
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const note_input = `\`INPUT[number(placeholder(Note)):note]\``;
const note_view = `\`VIEW[{note}]\``;
const ingredients_view = `\`VIEW[{ingredients}][text(renderMarkdown)]\``;
if(context.bound.view){
	return engine.markdown.create(`${note_view}\n${ingredients_view}`);
}
else{
	return engine.markdown.create(`${note_input}`);
}
```
```meta-bind-js-view
{view} as view
---
if(context.bound.view){
	const content_view = `\`VIEW[{content}][text(renderMarkdown)]\``;
	return engine.markdown.create(`${context.metadata.frontmatter.content}`);
}
else {
	const comp = engine.markdown.create("```meta-bind\nINPUT[editor:content]\n```");
	return comp;
}
```
