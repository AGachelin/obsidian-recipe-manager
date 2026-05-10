
```js-engine
/**
 * Duration Input Mountable Component
 * Renders duration input with hours, minutes, seconds selectors
 */
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const comp = new obsidian.Component(component);
component.addChild(comp);

const bindTargetView = mb.parseBindTarget('view', context.file.path);
const RenderChildType = mb.RenderChildType;

// Extract duration type from context (e.g., 'cook', 'prep', 'rest')
const durationType = context.args?.type || 'cook';
const durationTypeLabel = {
    'cook': 'Cuisson',
    'prep': 'Préparation',
    'rest': 'Repos'
}[durationType] || durationType.charAt(0).toUpperCase() + durationType.slice(1);

function getDurationLabel() {
    return `Durée de ${durationTypeLabel.toLowerCase()}`;
}

function createSelectOptions(max) {
    return Array.from({ length: max }, (_, i) => `option(${i})`).join(', ');
}

function render(view) {
    comp.unload();
    comp.load();
    container.empty();

    if (!view) {
        // Input mode - with dropdowns
        const frontmatter = context.metadata.frontmatter;
        const splitTimes = mb.mb.math.splitTime(frontmatter[durationType], true);
        
        const containerDiv = container.createEl('div', { cls: 'duration-input-group' });
        containerDiv.createEl('label', { text: getDurationLabel() + ': ' });
        
        const inputContainer = containerDiv.createEl('div', { cls: 'duration-inputs' });

        // Hour select
        const hourSelect = mb.createInputFieldMountable(context.file.path, {
            renderChildType: RenderChildType.INLINE,
            declaration: `INLINE_SELECT[defaultValue(${splitTimes[0]}), ${createSelectOptions(24)}:memory^${durationType}.hour]`
        });
        mb.wrapInMDRC(hourSelect, inputContainer, comp);
        inputContainer.createEl('span', { text: 'h ' });

        // Minute select
        const minSelect = mb.createInputFieldMountable(context.file.path, {
            renderChildType: RenderChildType.INLINE,
            declaration: `INLINE_SELECT[defaultValue(${splitTimes[1]}), ${createSelectOptions(60)}:memory^${durationType}.min]`
        });
        mb.wrapInMDRC(minSelect, inputContainer, comp);
        inputContainer.createEl('span', { text: 'min ' });

        // Second select
        const secSelect = mb.createInputFieldMountable(context.file.path, {
            renderChildType: RenderChildType.INLINE,
            declaration: `INLINE_SELECT[defaultValue(${splitTimes[2]}), ${createSelectOptions(60)}:memory^${durationType}.sec]`
        });
        mb.wrapInMDRC(secSelect, inputContainer, comp);
        inputContainer.createEl('span', { text: 's' });

        // Hidden total view for math binding
        const totalView = mb.createViewFieldMountable(context.file.path, {
            renderChildType: RenderChildType.INLINE,
            declaration: `number({memory^${durationType}.hour} h, s)+number({memory^${durationType}.min} minute, s)+number({memory^${durationType}.sec} s, s)[math(hidden):${durationType}]`
        });
        mb.wrapInMDRC(totalView, containerDiv, comp);

    } else {
        // View mode - formatted display
        const viewContainer = container.createEl('div', { cls: 'duration-view-group' });
        viewContainer.createEl('strong', { text: durationTypeLabel + ': ' });

        const durationView = mb.createViewFieldMountable(context.file.path, {
            renderChildType: RenderChildType.INLINE,
            declaration: `splitTime({${durationType}}, false)`
        });
        mb.wrapInMDRC(durationView, viewContainer, comp);
    }
}

const bindTargetViewSubscription = mb.subscribeToMetadata(
    bindTargetView,
    component,
    (value) => render(value)
);

render(context.metadata.frontmatter.view);
```
