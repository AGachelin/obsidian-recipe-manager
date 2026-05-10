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
		mb.wrapInMDRC(IncButton, span3, comp);
		mb.wrapInMDRC(DecButton, span3, comp);
		mb.wrapInMDRC(ResetButton, span3, comp);
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