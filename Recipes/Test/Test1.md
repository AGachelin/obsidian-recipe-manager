---
note: 4
content: "# test"
ingredients:
  - name: "[[Ingredients/test.md|test]]"
    amount: 3
    unit: "-"
  - {}
  - {}
view: false
---


Edit : `INPUT[toggle(showcase, title(Edit)):view]`

```meta-bind-js-view
{note} as note
{ingredients} as ingredients
{view} as view
{content} as content
---
// get current view : this.app.workspace.activeLeaf.view.currentMode.type
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;

const note_input = `\`INPUT[number(placeholder(Note)):note]\``;
const content_input = `\`INPUT[editor:content]\``;
if(context.bound.view){
	return engine.markdown.create(`${context.bound.note}\n${context.bound.ingredients}\n${context.bound.content}`);
}
else{
	return engine.markdown.create(`${note_input}\n${content_input}`);
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
	const tableOptions = {
		bindTarget: mb.createBindTarget('frontmatter', context.file.path, ['ingredients']),
		tableHead: ['Nom', 'Quantité', 'Unité'],
		columns: [
			'INPUT[suggester(optionQuery("Ingredients")):scope^name]',
			'INPUT[number:scope^amount]',
			'INPUT[inlineSelect(option(-, unproductive), option(0, normal), option(+, productive)):scope^unit]'
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

