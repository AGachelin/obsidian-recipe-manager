<%*
const defaultName = tp.file.title==="ing" ? '' : tp.file.title;
const name = await tp.system.prompt("Ingredient name", defaultName, true);
await tp.file.rename(name);
const taxonomy = [];
let segment = await tp.system.prompt("Category (leave empty to finish)", "", false);
while (segment && String(segment).trim()) {
	taxonomy.push(String(segment).trim());
	segment = await tp.system.prompt("Sub-category (leave empty to finish)", "", false);
}
%>
<%* tR = "" -%>
---
taxonomy: [<%taxonomy%>]
liquid: 1
single: 1
cssclasses:
- ingredient-ui
---
```js-engine
return (await engine.importJs("source/src/lib/ingredient-live.js")).setupIngredientLive(
	engine,
	context,
	container,
	component
);
```