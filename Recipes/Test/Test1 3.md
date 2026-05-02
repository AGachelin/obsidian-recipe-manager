---
view: false
note:
ingredients:
  last_id: 2
content:
available_ingredients:
  - f.md
  - R.md
  - b.md
  - test.md
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
