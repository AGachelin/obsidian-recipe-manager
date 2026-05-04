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

