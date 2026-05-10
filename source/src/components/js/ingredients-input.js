async function run() {
    const tp = await engine.getPlugin("templater-obsidian")?.templater.current_functions_object;
    const mb = await engine.getPlugin('obsidian-meta-bind-plugin').api;

    const ingredientsManager = await engine.importJs("lib/ingredients-manager.js");

    const isChanging = context.args !== undefined;
    const availableIngredients = await tp.app.vault
        .getFolderByPath("Ingredients")
        .children.filter(x => x instanceof tp.obsidian.TFile)
        .map(x => x.name);

    const currentIngredients = context.metadata.frontmatter.ingredients;
    const availableOptions = ingredientsManager.filterAvailable(
        availableIngredients,
        currentIngredients,
        isChanging ? context.args.id : null
    );

    let selectedIngredient;
    if (isChanging) {
        selectedIngredient = await tp.system.suggester(
            ing => ing.split(".")[0],
            availableOptions
        );
        if (!selectedIngredient) return;
    } else {
        selectedIngredient = await tp.system.multi_suggester(
            ing => ing.split(".")[0],
            availableOptions
        );
        if (!selectedIngredient || selectedIngredient.length === 0) return;
    }

    const currentIngTarget = mb.createBindTarget('frontmatter', context.file.path, ['ingredients']);
    const availableIngTarget = mb.createBindTarget('frontmatter', context.file.path, ['available_ingredients']);

    const updateMode = isChanging ? 'change' : 'add';
    const updateId = isChanging ? context.args.id : null;

    mb.updateMetadata(
        currentIngTarget,
        (old) => ingredientsManager.updateIngredients(old, selectedIngredient, updateMode, updateId)
    );

    mb.updateMetadata(
        availableIngTarget,
        (old) => ingredientsManager.filterAvailable(availableIngredients, currentIngredients, updateId)
            .filter(i => !isChanging || i !== selectedIngredient)
            .filter(i => !Array.isArray(selectedIngredient) || !selectedIngredient.includes(i))
    );
}

run();
module.exports = run;