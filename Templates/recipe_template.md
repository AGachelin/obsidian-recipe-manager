---
note: 0
ingredients: []
content: ""
view: false
---
<%*
const fill_in = await tp.system.suggester(["Oui", "Non"], [true, false], false, "Fill-in automatically ?");
let note = "";
let content = "";
let ingredients = [];
const file = await tp.file.find_tfile(tp.file.path(true));
const available_ingredients = await tp.app.vault.getFolderByPath("Ingredients").children.filter(x => x instanceof tp.obsidian.TFile).map(x => x.name);
if(fill_in){
    note = await tp.system.prompt("Note");
    // ingredients = await tp.user.
    content = await tp.system.prompt("Content", null, false, true);
}
%>
<%* tR = "" -%>
---
view: false
note: <% note %>
ingredients: [0]
content: <% content %>
available_ingredients: <%available_ingredients%>
---
<% await tp.file.include(tp.file.find_tfile("toggle-button")) %>
<% await tp.file.include(tp.file.find_tfile("add-ingredient-button")) %>

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
