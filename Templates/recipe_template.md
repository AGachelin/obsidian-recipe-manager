---
note:
ingredients:
  - amount:
    unit: "-"
    name: at
  - name: "4"
    amount: 7
    unit: 0
view: true
content: |-
  # 1
  furieoznrjiezfrejizfrejzk,fre
  vnfreijzo
  ### 3
  this is a test
  #test
  gtrvbgtr
---
<%*
const fill_in = await tp.system.suggester(["Oui", "Non"], [true, false], false, "Fill-in automatically ?");
let note = "";
let content = "";
let ingredients = [];
const file = await tp.file.find_tfile(tp.file.path(true));
if(fill_in){
    note = await tp.system.prompt("Note");
    // ingredients = await tp.user.
    content = await tp.system.prompt("Content", null, false, true);
}
%>
<%* tR='' -%>
---
note: <% note %>
content: <% content %>
ingredients:
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
if(context.bound.view){
	return engine.markdown.create(`${context.bound.note}\n${context.bound.ingredients}`);
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
```meta-bind-js-view
{view} as view
---
if(context.bound.view){
	console.log(context);
	return engine.markdown.create(`${context.metadata.frontmatter.content}`);
}
else {
	const comp = engine.markdown.create("```meta-bind\nINPUT[editor:content]\n```");
	console.log(comp);
	return comp;
}
```
