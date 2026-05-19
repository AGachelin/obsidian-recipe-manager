import { resetPersonCurrentFromRaw } from "./person-memory.js";
import { waitForMetaBind } from "../render/wait-for-plugins.js";
import { resolveLanguage } from "../../shared/i18n/index.js";

export async function setupRecipeLive(engine, context, container, component, lang) {
    const path = context.file.path;
    const mb = await waitForMetaBind(engine);
    resetPersonCurrentFromRaw(mb, path);
    const resolvedLang = resolveLanguage(lang, engine);

    const [{ RecipeRenderer }, { readRecipeLiveMetadata, isRecipeViewMode, attachRecipeLiveSubscriptions }] =
        await Promise.all([
            engine.importJs("source/src/lib/recipe/recipe-renderer.js"),
            engine.importJs("source/src/lib/recipe/metadata.js"),
        ]);

    const renderer = new RecipeRenderer(path, resolvedLang);

    function renderRecipe() {
        const meta = readRecipeLiveMetadata(mb, path);
        renderer.render(mb, container, component, isRecipeViewMode(meta), meta);
    }

    const reactive = engine.reactive(renderRecipe);
    attachRecipeLiveSubscriptions(mb, component, path, () => reactive.refresh());
    return reactive;
}
