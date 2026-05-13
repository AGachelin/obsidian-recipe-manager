import { attachRecipeLiveSubscriptions, isRecipeViewMode, readRecipeLiveMetadata } from "./recipe-metadata.js";

export async function setupRecipeLive(engine, context, container, component) {
    const mb = engine.getPlugin("obsidian-meta-bind-plugin").api;
    const path = context.file.path;
    const { RecipeRenderer } = await engine.importJs("source/src/lib/recipe-renderer.js");
    const renderer = new RecipeRenderer(path);

    function renderRecipe() {
        const meta = readRecipeLiveMetadata(mb, path);
        renderer.render(mb, container, component, isRecipeViewMode(meta), meta);
    }

    const reactive = engine.reactive(renderRecipe);
    attachRecipeLiveSubscriptions(mb, component, path, () => reactive.refresh());
    return reactive;
}
