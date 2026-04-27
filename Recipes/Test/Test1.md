---
view: false
note:
content:
ingredients:
  - 4
  - id: 0
    name: ""
    amount: ""
    unit: ""
  - id: 1
    name: ""
    amount: ""
    unit: ""
  - id: 2
    name: ""
    amount: ""
    unit: ""
  - id: 3
    name: ""
    amount: ""
    unit: ""
  - id: 4
    name: ""
    amount: ""
    unit: ""
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










```meta-bind-button
style: default
label: add ingredient
id: add-ingredient
hidden: false
actions:
  - type: updateMetadata
    bindTarget: ingredients
    evaluate: true
    value: 'x == null|[] ? [0,{id:0,name:"",amount:"",unit:""}] : [x[0]+1, ...x.slice(1), {id:x[0]+1,name:"",amount:"",unit:""}]'   
  - type: "insertIntoNote"
    line: selfEnd - 14
    value: "Templates/elements/ingredients"
    templater: true
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
```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const comp = new obsidian.Component(component);
const bindTarget = mb.parseBindTarget('view', context.file.path);
function render(view){
	comp.unload();
	comp.load();
	container.empty();
	if(view){
		return;
	}
	//const options = mb.getMetadata(await mb.parseBindTarget('available_ingredients', context.file.path)).map(x => `option(${x})`).join(", ");
	const tableOptions = {
		bindTarget: mb.createBindTarget('frontmatter', context.file.path, ['ingredients']),
		tableHead: ['Nom', 'Quantité', 'Unité',''],
		columns: [
			'BUTTON[dark-mode]',
			'INPUT[number:scope^amount]',
			'INPUT[inlineSelect(option(-, unproductive), option(0, normal), option(+, productive)):scope^unit]',
			'INPUT[]'
		],
	};
	const table_mountable = mb.createTableMountable(context.file.path, tableOptions);
	mb.wrapInMDRC(table_mountable, container, component);
}
const reactive = engine.reactive(render, mb.getMetadata(bindTarget));
const subscription = mb.subscribeToMetadata(
	bindTarget,
	component,
	(value) => reactive.refresh(value)
);

return reactive;
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
	console.log(comp);
	return comp;
}
```
