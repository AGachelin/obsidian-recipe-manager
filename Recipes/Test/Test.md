---
view: false
note:
ingredients:
  last_id: 0
content:
available_ingredients:
  - b.md,
  - f.md,
  - R.md,
  - test.md
rest: 0
cook: 0
source:
oven:
prep: 0
person:
  current: 0
  raw: 1
tags:
cssclasses: global
---
<!-- Component Includes -->
```meta-bind-button
label: View
id: "switch-mode-view"
hidden: true
style: default
class: edit
actions:
  - type: updateMetadata
    bindTarget: view
    evaluate: false
    value: true
```
```meta-bind-button
label: Edit
id: "switch-mode-edit"
hidden: true
style: default
class: edit
actions:
  - type: updateMetadata
    bindTarget: view
    evaluate: false
    value: false
```
```meta-bind-js-view
{view} as view
---
if(context.bound.view){return engine.markdown.create("`BUTTON[switch-mode-edit]`");}
else{return engine.markdown.create("`BUTTON[switch-mode-view]`");}
```
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
		const inlineListConfig = {
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
		const inlineListOptions = {
		    declaration: inlineListConfig,
		    renderChildType: 'inline'
		};
		const InlineList = mb.createInputFieldMountable(context.file.path, inlineListOptions);
		mb.wrapInMDRC(InlineList, container, comp);
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


```js-engine
const mb_plugin = engine.getPlugin('obsidian-meta-bind-plugin');
const mb = mb_plugin.api;
const comp = new obsidian.Component(component);
const bindTarget_view = mb.parseBindTarget('view', context.file.path);
const bindTarget_ing = mb.parseBindTarget('available_ingredients', context.file.path);
const templateFile = 'source/src/components/ingredients.md'
async function addIngredient(view){
	if(view){
		container.empty();
		return;
	}
	const ing_to_add = await mb_plugin.mb.internal.evaluateTemplaterTemplate(templateFile, context.file.path);
	return engine.markdown.create(ing_to_add);
}
const reactive_ing = engine.reactive(addIngredient, mb.getMetadata(bindTarget_ing));
const subscription_view = mb.subscribeToMetadata(
	bindTarget_view,
	component,
	(value) => reactive_ing.refresh(value)
);
const subscription_ing = mb.subscribeToMetadata(
	bindTarget_ing,
	component,
	(value) => reactive_ing.refresh(mb.getMetadata(bindTarget_view))
);

return reactive_ing;
```
```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const comp = new obsidian.Component(component);
component.addChild(comp);
const bindTargetView = mb.parseBindTarget('view', context.file.path);
function render(view){
	comp.unload();
    comp.load();
    container.empty();
    if(!view){
	    const NewButtonConfig = {
			id: 'new-ingredient',
			style: 'default',
			label: 'new ingredient',
			hidden: true,
			action:
			{type: 'templaterCreateNote',
			templateFile: 'source/templatesingredient_template.md',
			folderPath: 'Ingredients',
			fileName: 'ing'}
		};
		const AddButtonConfig = {
			id: 'add-ingredient',
			style: 'default',
			label: 'add ingredient',
			hidden: false,
			action:
			{type: 'js',
			file: 'source/src/ingredients_input.js'}
		}
		const AddButtonOptions = {
		    declaration: AddButtonConfig,
		    isPreview: false
		};
		const NewButtonOptions = {
		    declaration: NewButtonConfig,
		    isPreview: false
		};
		const AddButton = mb.createButtonMountable(context.file.path, AddButtonOptions);
		const NewButton = mb.createButtonMountable(context.file.path, NewButtonOptions);
		const ButtonGroup = mb.createButtonGroupMountable(context.file.path, {
		declaration: {referencedButtonIds:['add-ingredient','new-ingredient']},
		renderChildType:'inline',
		})
		mb.wrapInMDRC(NewButton, container, comp);
		mb.wrapInMDRC(AddButton, container, comp);
		mb.wrapInMDRC(ButtonGroup, container, comp);
		
	}
}
const reactive = engine.reactive(render, mb.getMetadata(bindTargetView));
const subscription = mb.subscribeToMetadata(
	bindTargetView,
	component,
	(value) => reactive.refresh(value)
);

return reactive;
```

<!-- Main Recipe Input/View Components Container -->
```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const comp = new obsidian.Component(component);
component.addChild(comp);

const bindTargetNote = mb.parseBindTarget('memory', context.file.path, ['note']);
const bindTargetView = mb.parseBindTarget('view', context.file.path);

function render(view) {
    comp.unload();
    comp.load();
    container.empty();

    if (!view) {
        // Input mode
        const noteInputConfig = {
            inputType: 'number',
            defaultValue: context.metadata.frontmatter.note,
            placeholder: 'Note',
            minValue: 0,
            maxValue: 5
        };

        const noteInput = mb.createNumberInputMountable(context.file.path, {
            declaration: {
                bindTarget: 'note',
                defaultValue: context.metadata.frontmatter.note
            },
            isPreview: false
        });

        const noteView = mb.createViewMountable(context.file.path, {
            declaration: {
                bindTarget: 'note',
                renderValue: 'clamp({note}, 0, 5)',
                hidden: true
            },
            isPreview: false
        });

        const inputWrapper = container.createEl('div', { cls: 'input-field note-input' });
        const labelEl = inputWrapper.createEl('label', { text: 'Note: ' });
        
        mb.wrapInMDRC(noteInput, inputWrapper, comp);
        mb.wrapInMDRC(noteView, inputWrapper, comp);
    } else {
        // View mode
        const noteView = mb.createViewMountable(context.file.path, {
            declaration: {
                bindTarget: 'note',
                renderValue: '{note}'
            },
            isPreview: false
        });

        const viewWrapper = container.createEl('div', { cls: 'view-field note-view' });
        mb.wrapInMDRC(noteView, viewWrapper, comp);
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

```js-engine
/**
 * Oven Temperature Input Mountable Component
 * Renders oven temperature input with inline view
 */
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const comp = new obsidian.Component(component);
component.addChild(comp);

const bindTargetView = mb.parseBindTarget('view', context.file.path);

function render(view) {
    comp.unload();
    comp.load();
    container.empty();

    if (!view) {
        // Input mode
        const ovenInput = mb.createNumberInputMountable(context.file.path, {
            declaration: {
                bindTarget: 'oven',
                defaultValue: context.metadata.frontmatter.oven || 0,
                placeholder: 'Oven temp (°C)'
            },
            isPreview: false
        });

        const ovenView = mb.createViewMountable(context.file.path, {
            declaration: {
                bindTarget: 'oven',
                renderValue: 'bind({oven}, 0, null)',
                hidden: true
            },
            isPreview: false
        });

        const inputWrapper = container.createEl('div', { cls: 'input-field oven-input' });
        const labelEl = inputWrapper.createEl('label', { text: 'Oven Temperature: ' });
        
        mb.wrapInMDRC(ovenInput, inputWrapper, comp);
        mb.wrapInMDRC(ovenView, inputWrapper, comp);
    } else {
        // View mode
        const ovenView = mb.createViewMountable(context.file.path, {
            declaration: {
                bindTarget: 'oven',
                renderValue: '{oven}'
            },
            isPreview: false
        });

        const viewWrapper = container.createEl('div', { cls: 'view-field oven-view' });
        viewWrapper.createEl('label', { text: 'Oven: ' });
        mb.wrapInMDRC(ovenView, viewWrapper, comp);
        viewWrapper.createEl('span', { text: ' °C' });
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


