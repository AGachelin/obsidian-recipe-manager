---
taxonomy: []
liquid: 1
single: 1
---
<%*
const name = await tp.system.prompt("Ingredient name", '', true);
await tp.file.rename(name);

const taxonomy = [];
let segment = await tp.system.prompt("Category (leave empty to finish)", "", false);
while (segment && String(segment).trim()) {
    taxonomy.push(String(segment).trim());
    segment = await tp.system.prompt("Sub-category (leave empty to finish)", "", false);
}

const file = tp.file.find_tfile(name + ".md");
if (file) {
    await app.fileManager.processFrontMatter(file, (fm) => {
        fm.taxonomy = taxonomy;
    });
}
%>
Rho : `INPUT[number(defaultValue(liquid)):memory^liquid]` `VIEW[bind({memory^liquid}, 0, 1)][math(hidden):liquid]`
Weight of one unit : `INPUT[number(defaultValue(1)):memory^single]` `VIEW[bind({memory^single}, 0, 1)][math(hidden):single]`
