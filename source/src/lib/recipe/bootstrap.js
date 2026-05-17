export async function setupRecipeLive(engine, context, container, component) {
    const path = context.file.path;
    const mb = engine.getPlugin("obsidian-meta-bind-plugin").api;

    const [{ RecipeRenderer }, { readRecipeLiveMetadata, isRecipeViewMode, attachRecipeLiveSubscriptions }] =
        await Promise.all([
            engine.importJs("source/src/lib/recipe/recipe-renderer.js"),
            engine.importJs("source/src/lib/recipe/metadata.js"),
        ]);

    const renderer = new RecipeRenderer(path);

    function renderRecipe() {
        const meta = readRecipeLiveMetadata(mb, path);
        renderer.render(mb, container, component, isRecipeViewMode(meta), meta);
    }

    const reactive = engine.reactive(renderRecipe);
    attachRecipeLiveSubscriptions(mb, component, path, () => reactive.refresh());
    return reactive;
}
