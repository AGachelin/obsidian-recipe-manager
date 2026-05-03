---
view: true
note: 4
ingredients:
  "1":
    id: 1
    name: f.md
    amount: 5
    unit: ""
  last_id: 1
content: rezvfevr
available_ingredients:
  - b.md
  - R.md
  - test.md
rest: 0
cook: 58569
source: vfevre
oven:
prep: 0
person:
  current: 7
  raw: 7
cssclasses:
  - global
---


```meta-bind-button
label: View
id: "switch-mode-view"
hidden: true
style: default
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
const mb_plugin = engine.getPlugin('obsidian-meta-bind-plugin');
const mb = mb_plugin.api;
const comp = new obsidian.Component(component);
const bindTarget_view = mb.parseBindTarget('view', context.file.path);
const bindTarget_ing = mb.parseBindTarget('available_ingredients', context.file.path);
const templateFile = 'Templates/elements/ingredients.md'
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
			templateFile: 'Templates/ingredient_template.md',
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
			file: 'Templates/Scripts/ingredients_input.js'}
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
```js-engine
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const internal = engine.getPlugin('obsidian-meta-bind-plugin').mb.internal;
const comp = new obsidian.Component(component);
let builder = engine.markdown.createBuilder();
component.addChild(comp);
const bindTargetView = mb.parseBindTarget('view', context.file.path);
const bindTargetPerson = mb.parseBindTarget('person', context.file.path);
function render(view){
	comp.unload();
    comp.load();
    container.empty();
    const div = container.createEl('div', {cls:'same_row'})
    const span1 = div.createEl('span');
    const span2 = div.createEl('span');
    const span3 = container.createEl('span');
    container.createEl('br');
    if(view){
	    const person = mb.getMetadata(bindTargetPerson);
	    const IncButtonConfig = {
			label: "+1",
			hidden: true,
			id: "count-increment",
			style: "default",
			action:{
			    type: "updateMetadata",
			    bindTarget: "person.current",
			    evaluate: true,
			    value: "x + 1"
			}
		};
		const DecButtonConfig = {
			label: "-1",
			hidden: true,
			id: "count-decrement",
			style: "default",
			action:{
			    type: "updateMetadata",
			    bindTarget: "person.current",
			    evaluate: true,
			    value: "Math.max(0, x - 1)"
			}
		};
		const ResetButtonConfig = {
			label: "Reset",
			hidden: true,
			id: "count-reset",
			style: "default",
			action:{
			    type: "updateMetadata",
			    bindTarget: "person.current",
			    evaluate: true,
			    value: person.raw
			}
		};
		const IncButtonOptions = {
		    declaration: IncButtonConfig,
		    isPreview: false
		};
		const DecButtonOptions = {
		    declaration: DecButtonConfig,
		    isPreview: false
		};
		const ResetButtonOptions = {
		    declaration: ResetButtonConfig,
		    isPreview: false
		};
		
		const IncButton = mb.createButtonMountable(context.file.path, IncButtonOptions);
		const DecButton = mb.createButtonMountable(context.file.path, DecButtonOptions);
		const ResetButton = mb.createButtonMountable(context.file.path, ResetButtonOptions);
		mb.wrapInMDRC(IncButton, span3, comp);
		mb.wrapInMDRC(DecButton, span3, comp);
		mb.wrapInMDRC(ResetButton, span3, comp);
		const ButtonGroup = mb.createButtonGroupMountable(context.file.path, {
		declaration: {referencedButtonIds:['count-decrement', 'count-reset','count-increment']},
		renderChildType:'inline',
		});
		mb.wrapInMDRC(ButtonGroup, span2, comp);
		internal.renderMarkdown("`VIEW[{person.current} personnes][text]`", span1, context.file.path);
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
```meta-bind-js-view
{view} as view
---
const input_duration = await engine.importJs("duration-input.js");
const view_ingredients = await engine.importJs("view-ingredients.js");
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const frontmatter = context.metadata.frontmatter;
const note_input = `\`INPUT[number(placeholder(Note), defaultValue(`+frontmatter.note+`)):memory^note]\`` + ' '+ `\`VIEW[clamp({memory^note}, 0, 5)][math(hidden):note]\``;
const oven_input = `\`INPUT[number(placeholder(Oven temp), defaultValue(`+frontmatter.oven+`)):memory^oven]\`` + ' '+ `\`VIEW[bind({memory^oven}, 0, null)][math(hidden):oven]\``;
const person_input = `\`INPUT[number(placeholder(Nombre de personnes), defaultValue(`+frontmatter.person.raw+`)):memory^person.raw]\`` + ' '+ `\`VIEW[bind({memory^person.raw}, 0, 1)][math(hidden):person.raw]\``;
const content_input = "```meta-bind\nINPUT[editor:content]\n```";
const cook_input = input_duration.default("cook", mb.mb.math.splitTime(frontmatter.cook, true));
const rest_input = input_duration.default("rest", mb.mb.math.splitTime(frontmatter.rest, true));
const prep_input = input_duration.default("prep", mb.mb.math.splitTime(frontmatter.prep, true));
const source_input = `\`INPUT[text(placeholder(Source)):source]\``;
const source_view = `\`VIEW[{source}][text(renderMarkdown)]\``;
const note_view = `\`VIEW[{note}]\``;
const oven_view = `\`VIEW[{oven}]\``;
const cook_view = `\`VIEW[splitTime({cook}, false)]\``;
const rest_view = `\`VIEW[splitTime({rest}, false)]\``;
const prep_view = `\`VIEW[splitTime({prep}, false)]\``;
const content_view = `\`VIEW[{content}][text(renderMarkdown)]\``;
const ingredients_view = view_ingredients.default(frontmatter.ingredients);
if(context.bound.view){
	return engine.markdown.create(`${note_view}\n${source_view}\n${ingredients_view}\n${cook_view}\n${rest_view}\n${prep_view}\n${content_view}`);
}
else{
	return engine.markdown.create(`${note_input}\n${source_input}\n${person_input}\n${cook_input}\n${rest_input}\n${prep_input}\n${content_input}`);
}
```
