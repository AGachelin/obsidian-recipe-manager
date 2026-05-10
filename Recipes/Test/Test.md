---
view: true
note:
ingredients:
  "1":
    id: 1
    name: R.md
    amount: 75
    unit: sachet
  last_id: 1
content:
available_ingredients:
  - b.md
  - f.md
  - test.md
rest: 0
cook: 69310
source:
oven:
prep: 0
person:
  current: 0
  raw: 1
tags:
cssclasses: global
---
```meta-bind-js-view
{view} as view
---
const duration_input = await engine.importJs("/source/src/components/js/duration-input.js");
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const dur = new duration_input.DurationInput(context.file.path, mb.createBindTarget("memory", context.file.path, ["cook", "hour"]), mb.createBindTarget("memory", context.file.path, ["cook", "min"]), mb.createBindTarget("memory", context.file.path, ["cook", "sec"]), mb.createBindTarget("frontmatter", context.file.path, ["cook"]), "cook");
const render = dur.render(mb, context.bound.view, context.metadata.frontmatter.cook);
let div;
for(val of render){
	div = container.createEl("div");
	mb.wrapInMDRC(val, div, component);
}
```
```meta-bind-js-view
{view} as view
{available_ingredients} as _
---
const ingredientTable = await engine.importJs("/source/src/components/js/ingredient-table.js");
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const dur = new ingredientTable.IngredientTable(context.file.path);
const render = dur.render(mb, context.metadata.frontmatter.ingredients);
let div;
let span;
if(context.bound.view){
	for(row of render){
		div = container.createEl("div", {cls: 'same-row'});
		for(ing of row){
			span = div.createEl("span");
			mb.wrapInMDRC(ing, span, component);
		}
	}
}
```

