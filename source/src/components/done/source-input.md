```js-engine
/**
 * Source/Link Input Mountable Component
 * Renders source URL/link input with formatted view
 */
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const comp = new obsidian.Component(component);
component.addChild(comp);

const bindTargetView = mb.parseBindTarget('view', context.file.path);
const RenderChildType = mb.RenderChildType;

function render(view) {
    comp.unload();
    comp.load();
    container.empty();

    if (!view) {
        // Input mode
        const sourceInput = mb.createInputFieldMountable(context.file.path, {
            renderChildType: 'inline',
            declaration: {
                inputFieldType: 'text',
                bindTarget: mb.createBindTarget('frontmatter', context.file.path, ['source']),
                arguments: [
                    { name: 'defaultValue', value: [context.metadata.frontmatter.source || ''] },
                    { name: 'placeholder', value: ['Recipe source'] }
                ]
            },
            scope: 'frontmatter'
        });

        const inputWrapper = container.createEl('div', { cls: 'input-field source-input' });
        inputWrapper.createEl('label', { text: 'Source: ' });
        mb.wrapInMDRC(sourceInput, inputWrapper, comp);
    } else {
        // View mode
        const sourceView = mb.createViewFieldMountable(context.file.path, {
            renderChildType: 'inline',
            declaration: {
                viewFieldType: 'text',
                bindTarget: mb.createBindTarget('frontmatter', context.file.path, ['source']),
                arguments: [
                    { name: 'renderMarkdown', value: [] }
                ]
            },
            scope: 'frontmatter'
        });

        const viewWrapper = container.createEl('div', { cls: 'view-field source-view' });
        viewWrapper.createEl('strong', { text: 'Source: ' });
        mb.wrapInMDRC(sourceView, viewWrapper, comp);
    }
}

const bindTargetViewSubscription = mb.subscribeToMetadata(
    bindTargetView,
    component,
    (value) => render(value)
);

render(context.metadata.frontmatter.view);
```
