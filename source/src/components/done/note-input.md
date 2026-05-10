```js-engine
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
        const noteInput = mb.createInputFieldMountable(context.file.path, {
            renderChildType: 'inline',
            declaration: {
                inputFieldType: 'number',
                bindTarget: mb.createBindTarget('frontmatter', context.file.path, ['note']),
                arguments: [
                    { name: 'defaultValue', value: [context.metadata.frontmatter.note] },
                    { name: 'min', value: [0] },
                    { name: 'max', value: [5] }
                ]
            },
            scope: 'frontmatter'
        });

        const noteViewHidden = mb.createViewFieldMountable(context.file.path, {
            renderChildType: 'inline',
            declaration: {
                viewFieldType: 'math',
                bindTarget: mb.createBindTarget('frontmatter', context.file.path, ['note']),
                arguments: [
                    { name: 'clamp', value: ['{note}', 0, 5] },
                    { name: 'hidden', value: [] }
                ]
            },
            scope: 'frontmatter'
        });

        const inputWrapper = container.createEl('div', { cls: 'input-field note-input' });
        inputWrapper.createEl('label', { text: 'Note: ' });
        mb.wrapInMDRC(noteInput, inputWrapper, comp);
        mb.wrapInMDRC(noteViewHidden, inputWrapper, comp);
    } else {
        // View mode
        const noteView = mb.createViewFieldMountable(context.file.path, {
            renderChildType: 'inline',
            declaration: {
                viewFieldType: 'text',
                bindTarget: mb.createBindTarget('frontmatter', context.file.path, ['note']),
                arguments: []
            },
            scope: 'frontmatter'
        });

        const viewWrapper = container.createEl('div', { cls: 'view-field note-view' });
        mb.wrapInMDRC(noteView, viewWrapper, comp);
    }
}

const bindTargetViewSubscription = mb.subscribeToMetadata(
    bindTargetView,
    component,
    (value) => render(value)
);

render(context.metadata.frontmatter.view);
```
