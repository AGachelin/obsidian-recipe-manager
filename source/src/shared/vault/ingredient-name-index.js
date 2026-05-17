import { collectUniqueIngredientNames } from "./recipes.js";

/** @type {{ names: string[]; stamp: number } | null} */
let cache = null;

/**
 * Cached sorted ingredient names from all recipe notes.
 * Invalidates when the vault or metadata cache changes (debounced).
 *
 * @param {import("obsidian").App} app
 * @returns {Promise<string[]>}
 */
export async function getCachedIngredientNames(app) {
    if (cache) {
        return cache.names;
    }
    return refreshIngredientNames(app);
}

/**
 * @param {import("obsidian").App} app
 * @returns {Promise<string[]>}
 */
export function refreshIngredientNames(app) {
    const names = collectUniqueIngredientNames(app);
    cache = { names, stamp: Date.now() };
    return Promise.resolve(names);
}

let invalidationAttached = false;

/**
 * @param {import("obsidian").App} app
 */
export function attachIngredientNameIndexInvalidation(app) {
    if (invalidationAttached) return;
    invalidationAttached = true;

    let timer = null;
    const bump = () => {
        cache = null;
    };
    const schedule = () => {
        if (timer != null) window.clearTimeout(timer);
        timer = window.setTimeout(bump, 400);
    };
    app.metadataCache.on("changed", schedule);
    app.vault.on("create", schedule);
    app.vault.on("delete", schedule);
    app.vault.on("rename", schedule);
}
