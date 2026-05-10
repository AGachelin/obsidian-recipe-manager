```js-engine
/**
 * Recipe Inputs Container Component
 * Renders all recipe metadata input fields with proper layout
 * Includes: note, oven, person, durations (cook, prep, rest), source
 */
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const comp = new obsidian.Component(component);
component.addChild(comp);

const bindTargetView = mb.parseBindTarget('view', context.file.path);

async function createDurationInputs(container, durations) {
    const durationsDiv = container.createEl('div', { cls: 'durations-group' });
    
    for (const duration of durations) {
        const durationComponent = await tp.file.include(
            tp.file.find_tfile('source/src/components/duration-input'),
            false,
            { type: duration }
        );
        // This will be handled by template inclusion
    }
}

function render(view) {
    comp.unload();
    comp.load();
    container.empty();

    if (!view) {
        // Input mode - organize all input fields
        const mainContainer = container.createEl('div', { cls: 'recipe-inputs-container' });
        
        // Top section - basic info
        const basicInfoSection = mainContainer.createEl('div', { cls: 'section basic-info' });
        basicInfoSection.createEl('h3', { text: 'Basic Information' });
        
        const basicGrid = basicInfoSection.createEl('div', { cls: 'grid-2col' });

        // Note input will be included via template
        const noteDiv = basicGrid.createEl('div', { cls: 'input-wrapper note-wrapper' });
        
        // Oven input will be included via template
        const ovenDiv = basicGrid.createEl('div', { cls: 'input-wrapper oven-wrapper' });

        // Person input (via existing person-button component)
        const personDiv = basicGrid.createEl('div', { cls: 'input-wrapper person-wrapper' });

        // Duration section
        const durationSection = mainContainer.createEl('div', { cls: 'section durations' });
        durationSection.createEl('h3', { text: 'Cooking Times' });
        
        const durationGrid = durationSection.createEl('div', { cls: 'grid-3col' });
        const prepDiv = durationGrid.createEl('div', { cls: 'input-wrapper prep-wrapper' });
        const cookDiv = durationGrid.createEl('div', { cls: 'input-wrapper cook-wrapper' });
        const restDiv = durationGrid.createEl('div', { cls: 'input-wrapper rest-wrapper' });

        // Source section
        const sourceSection = mainContainer.createEl('div', { cls: 'section source' });
        const sourceDiv = sourceSection.createEl('div', { cls: 'input-wrapper source-wrapper' });

        // Content section
        const contentSection = mainContainer.createEl('div', { cls: 'section content' });
        contentSection.createEl('h3', { text: 'Recipe Content' });
        const contentDiv = contentSection.createEl('div', { cls: 'input-wrapper content-wrapper' });

    } else {
        // View mode - clean organized display
        const mainContainer = container.createEl('div', { cls: 'recipe-view-container' });
        
        // Header with basic info
        const headerSection = mainContainer.createEl('div', { cls: 'section header' });
        const infoGrid = headerSection.createEl('div', { cls: 'grid-2col' });
        
        const noteDiv = infoGrid.createEl('div', { cls: 'view-wrapper note-view-wrapper' });
        const ovenDiv = infoGrid.createEl('div', { cls: 'view-wrapper oven-view-wrapper' });

        // Cooking info
        const cookingSection = mainContainer.createEl('div', { cls: 'section cooking-info' });
        const timesGrid = cookingSection.createEl('div', { cls: 'grid-3col' });
        const prepDiv = timesGrid.createEl('div', { cls: 'view-wrapper prep-view-wrapper' });
        const cookDiv = timesGrid.createEl('div', { cls: 'view-wrapper cook-view-wrapper' });
        const restDiv = timesGrid.createEl('div', { cls: 'view-wrapper rest-view-wrapper' });

        // Source
        const sourceSection = mainContainer.createEl('div', { cls: 'section source-info' });
        const sourceDiv = sourceSection.createEl('div', { cls: 'view-wrapper source-view-wrapper' });

        // Content display
        const contentSection = mainContainer.createEl('div', { cls: 'section content-display' });
        const contentDiv = contentSection.createEl('div', { cls: 'view-wrapper content-view-wrapper' });
    }
}

const bindTargetViewSubscription = mb.subscribeToMetadata(
    bindTargetView,
    component,
    (value) => {
        render(value);
    }
);

render(context.metadata.frontmatter.view);
```
