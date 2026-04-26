module.exports = function () {
    let ingredient_list = {};
    let available_ingredients = await tp.app.vault.getFolderByPath("Ingredients").children.filter(x => x instanceof tp.obsidian.TFile).map(x => x.name);
    return ingredient_list;
};