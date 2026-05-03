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
ingredients: {last_id: 0}
content: <% content %>
available_ingredients: <%available_ingredients.map(ing => `\n- ${ing}`)%>
rest: 0
cook: 0
source:
oven:
prep: 0
person:
  current: 0
  raw: 1
---
<% await tp.file.include(tp.file.find_tfile("toggle-button")) %>
<% await tp.file.include(tp.file.find_tfile("ingredient-table"))%>
<% await tp.file.include(tp.file.find_tfile("add-ingredient-button")) %>
<% await tp.file.include(tp.file.find_tfile("person-button")) %>
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
