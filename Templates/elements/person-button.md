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