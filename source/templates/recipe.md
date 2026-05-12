<%* const title = await tp.system.prompt("Name", default_value="Test1", throw_on_cancel=true);
let types = await tp.app.vault.getFolderByPath("Recipes").children.filter(x => x instanceof tp.obsidian.TFolder).map(x => x.name);
types.push("Other");
let type = await tp.system.suggester(types, types, true, "Type of recipe", default_value=types[0]);
if(type=="Other"){
    type = await tp.system.prompt("Type of recipe", default_value="Test", throw_on_cancel=true);
    await tp.app.vault.createFolder("Recipes/"+type);
}
const folderPath = `Recipes/${type}/${title}`;
await tp.app.vault.createFolder(folderPath);
await tp.file.create_new(tp.file.find_tfile("recipe_template"), `${title}`, true, folderPath);
await tp.app.vault.create(`${folderPath}/content.md`, "");
%>