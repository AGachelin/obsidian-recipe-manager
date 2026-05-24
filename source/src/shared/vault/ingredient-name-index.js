import {
    attachIngredientCatalogInvalidation,
    flattenCatalogNames,
    getIngredientCatalog,
    refreshIngredientCatalog,
} from "./ingredient-catalog.js";

/**
 * Cached sorted ingredient names from the ingredient catalog.
 *
 * @param {import("obsidian").App} app
 * @returns {Promise<string[]>}
 */
export async function getCachedIngredientNames(app) {
    attachIngredientCatalogInvalidation(app);
    return flattenCatalogNames(getIngredientCatalog(app));
}

/**
 * @param {import("obsidian").App} app
 * @returns {Promise<string[]>}
 */
export function refreshIngredientNames(app) {
    return Promise.resolve(flattenCatalogNames(refreshIngredientCatalog(app)));
}
