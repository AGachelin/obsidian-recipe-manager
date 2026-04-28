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