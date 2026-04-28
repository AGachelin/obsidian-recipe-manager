---
view: false
note:
ingredients:
  - 3
  - amount:
content: cdecf exdezcefc
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

```meta-bind-button
id: add-ingredient
style: default
label: add ingredient
hidden: false
actions:
  - type: updateMetadata
    bindTarget: ingredients
    evaluate: true
    value: 'x == null|[] ? [0,{id:0,name:"",amount:"",unit:""}] : [x[0]+1, ...x.slice(1), {id:x[0]+1,name:"",amount:"",unit:""}]'
  - type: sleep
    ms: 200
  - type: "insertIntoNote"
    line: selfStart+4
    value: "Templates/elements/ingredients"
    templater: true   
```

```meta-bind-js-view
{view} as view
---
// get current view : this.app.workspace.activeLeaf.view.currentMode.type
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const note_input = `\`INPUT[number(placeholder(Note)):note]\``;
const note_view = `\`VIEW[{note}]\``;
const ingredients_view = `\`VIEW[{ingredients}][text(renderMarkdown)]\``;
if(context.bound.view){
	return engine.markdown.create(`${note_view}\n${ingredients_view}`);
}
else{
	return engine.markdown.create(`${note_input}`);
}
```
```meta-bind-js-view
{view} as view
---
if(context.bound.view){
	const content_view = `\`VIEW[{content}][text(renderMarkdown)]\``;
	return engine.markdown.create(`${context.metadata.frontmatter.content}`);
}
else {
	const comp = engine.markdown.create("```meta-bind\nINPUT[editor:content]\n```");
	return comp;
}
```
