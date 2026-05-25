import { waitForMetaBind } from "../render/wait-for-plugins.js";
import { resolveLanguage } from "../../shared/i18n/index.js";
import { attachIngredientCatalogInvalidation } from "../../shared/vault/ingredient-catalog.js";

export async function setupIngredientLive(engine, context, container, component, lang) {
    const path = context.file.path;
    const mb = await waitForMetaBind(engine);
    const resolvedLang = resolveLanguage(lang, engine);
    attachIngredientCatalogInvalidation(engine.app);

    const [{ IngredientRenderer }, { readIngredientLiveMetadata, attachIngredientLiveSubscriptions }] =
        await Promise.all([
            engine.importJs("source/src/lib/ingredient/ingredient-renderer.js"),
            engine.importJs("source/src/lib/ingredient/metadata.js"),
        ]);

    const renderer = new IngredientRenderer(path, resolvedLang);
    const reactive = engine.reactive(() => {
        const meta = readIngredientLiveMetadata(mb, path);
        renderer.render(mb, container, component, meta);
    });
    return reactive;
}
