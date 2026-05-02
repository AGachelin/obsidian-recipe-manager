```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const bindTargetCurrentIng = mb.parseBindTarget('ingredients', context.file.path);
const buttonConfig = {
	id: 'add-ingredient',
	style: 'default',
	label: 'add ingredient',
	hidden: false,
	action:
	{type: 'js',
	file: 'Templates/Scripts/ingredients_input.js',
}
}
const buttonOptions = {
    declaration: buttonConfig,
    isPreview: false
};
const button = mb.createButtonMountable(context.file.path, buttonOptions);
mb.wrapInMDRC(button, container, component);
```