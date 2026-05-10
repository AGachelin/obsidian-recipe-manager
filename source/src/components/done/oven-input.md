```js-engine
/**
 * Oven Temperature Input Mountable Component
 * Renders oven temperature input with inline view
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
        const ovenInput = mb.createInputFieldMountable(context.file.path, {
            renderChildType: RenderChildType.INLINE,
            declaration: `NUMBER[defaultValue(${context.metadata.frontmatter.oven || 0}), placeholder(Oven temp):oven]`
        });

        const ovenViewHidden = mb.createViewFieldMountable(context.file.path, {
            renderChildType: RenderChildType.INLINE,
            declaration: `bind({oven}, 0, null)[math(hidden):oven]`
        });

        const inputWrapper = container.createEl('div', { cls: 'input-field oven-input' });
        inputWrapper.createEl('label', { text: 'Oven Temperature: ' });
        
        mb.wrapInMDRC(ovenInput, inputWrapper, comp);
        mb.wrapInMDRC(ovenViewHidden, inputWrapper, comp);
    } else {
        // View mode
        const ovenView = mb.createViewFieldMountable(context.file.path, {
            renderChildType: RenderChildType.INLINE,
            declaration: `{oven}`
        });

        const viewWrapper = container.createEl('div', { cls: 'view-field oven-view' });
        viewWrapper.createEl('label', { text: 'Oven: ' });
        mb.wrapInMDRC(ovenView, viewWrapper, comp);
        viewWrapper.createEl('span', { text: ' °C' });
    }
        if (!view) {
            // Input mode
            const ovenInput = mb.createInputFieldMountable(context.file.path, {
                renderChildType: 'inline',
                declaration: {
                    inputFieldType: 'number',
                    bindTarget: mb.createBindTarget('frontmatter', context.file.path, ['oven']),
                    arguments: [
                        { name: 'defaultValue', value: [context.metadata.frontmatter.oven || 0] },
                        { name: 'placeholder', value: ['Oven temp'] }
                    ]
                },
                scope: 'frontmatter'
            });

            const ovenViewHidden = mb.createViewFieldMountable(context.file.path, {
                renderChildType: 'inline',
                declaration: {
                    viewFieldType: 'math',
                    bindTarget: mb.createBindTarget('frontmatter', context.file.path, ['oven']),
                    arguments: [
                        { name: 'bind', value: ['{oven}', 0, null] },
                        { name: 'hidden', value: [] }
                    ]
                },
                scope: 'frontmatter'
            });

            const inputWrapper = container.createEl('div', { cls: 'input-field oven-input' });
            inputWrapper.createEl('label', { text: 'Oven Temperature: ' });
            mb.wrapInMDRC(ovenInput, inputWrapper, comp);
            mb.wrapInMDRC(ovenViewHidden, inputWrapper, comp);
        } else {
            // View mode
            const ovenView = mb.createViewFieldMountable(context.file.path, {
                renderChildType: 'inline',
                declaration: {
                    viewFieldType: 'text',
                    bindTarget: mb.createBindTarget('frontmatter', context.file.path, ['oven']),
                    arguments: []
                },
                scope: 'frontmatter'
            });

            const viewWrapper = container.createEl('div', { cls: 'view-field oven-view' });
            mb.wrapInMDRC(ovenView, viewWrapper, comp);
        }
}

const bindTargetViewSubscription = mb.subscribeToMetadata(
    bindTargetView,
    component,
    (value) => render(value)
);

render(context.metadata.frontmatter.view);
```
