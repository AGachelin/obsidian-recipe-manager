```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const internal = engine.getPlugin('obsidian-meta-bind-plugin').mb.internal;
const comp = new obsidian.Component(component);
component.addChild(comp);

const bindTargetView = mb.parseBindTarget('view', context.file.path);

function render(view) {
	const internal = engine.getPlugin('obsidian-meta-bind-plugin').mb.internal;
    comp.unload();
    comp.load();
    container.empty();

    if (!view) {
        const inputWrapper = container.createEl('div', { cls: 'input-field content-input' });
        internal.renderMarkdown('[[content|Modifier le contenu]]', inputWrapper, context.file.path);
    } else {
        const viewWrapper = container.createEl('div', { cls: 'view-field content-view' });
        internal.renderMarkdown('```meta-bind-embed\n[[content]]\n```', viewWrapper, context.file.path);
    }
}

const reactive = engine.reactive(render, mb.getMetadata(bindTargetView));
const bindTargetViewSubscription = mb.subscribeToMetadata(
	bindTargetView,
	component,
	(value) => reactive.refresh(value)
);

return reactive;
```