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