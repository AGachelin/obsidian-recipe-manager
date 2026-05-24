import { FRONTMATTER } from "../constants/recipe.js";

/** Vault folder containing recipe notes (Dataview path and file walk). */
export const RECIPES_FOLDER = "Recipes";

const LAST_ID = FRONTMATTER.INGREDIENTS_FIELDS.LAST_ID;

/**
 * @param {import("obsidian").TFile} file
 */
export function isRecipeListFile(file) {
    return file.path.startsWith(`${RECIPES_FOLDER}/`) && file.name.toLowerCase() !== "content.md";
}

/**
 * @param {import("obsidian").App} app
 * @returns {import("obsidian").TFile[]}
 */
export function listRecipeMarkdownFiles(app) {
    return app.vault.getMarkdownFiles().filter(isRecipeListFile);
}

/**
 * Ingredient rows from a recipe `ingredients` frontmatter object (skips `last_id`).
 * @param {Record<string, unknown> | null | undefined} ing
 */
export function* iterIngredientRows(ing) {
    if (!ing || typeof ing !== "object") return;
    for (const [key, row] of Object.entries(ing)) {
        if (key === LAST_ID) continue;
        if (row && typeof row === "object") yield row;
    }
}

/**
 * @param {import("obsidian").App} app
 * @returns {string[]}
 */
export function collectUniqueIngredientNames(app) {
    const names = new Set();
    const recipeFolder = app.vault.getAbstractFileByPath(RECIPES_FOLDER);
    if (!recipeFolder || !("children" in recipeFolder) || !recipeFolder.children) {
        return [];
    }

    const walk = (folder) => {
        if (!folder.children) return;
        for (const file of folder.children) {
            if ("children" in file && file.children) {
                walk(file);
            } else if (file.extension === "md") {
                const cache = app.metadataCache.getFileCache(file);
                const ingredients = cache?.frontmatter?.ingredients;
                if (ingredients && typeof ingredients === "object") {
                    for (const row of iterIngredientRows(ingredients)) {
                        const name = String(row.name ?? "").trim();
                        if (name) names.add(name);
                    }
                }
            }
        }
    };

    walk(recipeFolder);
    return Array.from(names).sort((a, b) => a.localeCompare(b));
}

/**
 * Build a Dataview-shaped page object from the metadata cache.
 * @param {import("obsidian").App} app
 * @param {import("obsidian").TFile} file
 */
export function recipePageFromFile(app, file) {
    const fm = app.metadataCache.getCache(file)?.frontmatter ?? {};
    return {
        file,
        note: fm.note,
        prep_duration: fm.prep_duration,
        cook_duration: fm.cook_duration,
        rest_duration: fm.rest_duration,
        cool_duration: fm.cool_duration,
        freeze_duration: fm.freeze_duration,
        source: fm.source,
        tags: fm.tags,
        thumbnail: fm.thumbnail,
        ingredients: fm.ingredients,
        ingredient_groups: fm.ingredient_groups,
    };
}

/**
 * @param {import("obsidian").App} app
 * @param {string} pathCtx Note path for wikilink resolution
 * @param {unknown} thumbnail
 * @returns {string | null}
 */
export function resolveRecipeThumbnailUrl(app, pathCtx, thumbnail) {
    const raw = thumbnail == null ? "" : String(thumbnail).trim();
    if (!raw) return null;

    let linkPath = raw;
    const wiki = raw.match(/^\[\[([^\]|]+)(?:\|[^\]]+)?\]\]$/);
    if (wiki) {
        linkPath = wiki[1].trim();
    }

    const dest =
        app.metadataCache.getFirstLinkpathDest(linkPath, pathCtx) ??
        app.vault.getAbstractFileByPath(linkPath);
    if (!dest || !("extension" in dest)) {
        return null;
    }
    return app.vault.getResourcePath(/** @type {import("obsidian").TFile} */ (dest));
}
