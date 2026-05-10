function filterAvailable(available, current, excludeId = null) {
    const currentIds = Object.keys(current)
        .filter(i => i !== "last_id" && i !== excludeId)
        .map(i => current[i].name);

    return available.filter(i => !currentIds.includes(i));
}

function updateIngredients(oldIngredients, newIngredients, mode = 'add', ingredientId = null) {
    if (mode === 'change' && ingredientId) {
        oldIngredients[ingredientId].name = newIngredients;
        return oldIngredients;
    }

    if (Array.isArray(newIngredients)) {
        for (const ingredient of newIngredients) {
            oldIngredients.last_id++;
            oldIngredients[oldIngredients.last_id] = {
                id: oldIngredients.last_id,
                name: ingredient,
                amount: 0,
                unit: ''
            };
        }
    }

    return oldIngredients;
}

async function run() {
    const tp = await engine.getPlugin("templater-obsidian")?.templater.current_functions_object;
    const mb = await engine.getPlugin('obsidian-meta-bind-plugin').api;

    const isChanging = context.args !== undefined;
    const availableIngredients = await tp.app.vault
        .getFolderByPath("Ingredients")
        .children.filter(x => x instanceof tp.obsidian.TFile)
        .map(x => x.name);

    const currentIngredients = context.metadata.frontmatter.ingredients;
    const availableOptions = filterAvailable(
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

    const currentIngTarget = mb.createBindTarget('frontmatter', this.path, ['ingredients']);
    const availableIngTarget = mb.createBindTarget('frontmatter', this.path, ['available_ingredients']);

    const updateMode = isChanging ? 'change' : 'add';
    const updateId = isChanging ? context.args.id : null;

    mb.updateMetadata(
        currentIngTarget,
        (old) => updateIngredients(old, selectedIngredient, updateMode, updateId)
    );

    mb.updateMetadata(
        availableIngTarget,
        (old) => filterAvailable(availableIngredients, currentIngredients, updateId)
            .filter(i => !isChanging || i !== selectedIngredient)
            .filter(i => !Array.isArray(selectedIngredient) || !selectedIngredient.includes(i))
    );
}

run();
module.exports = run;