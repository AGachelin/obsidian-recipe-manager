import { RECIPES_FOLDER } from "../../shared/vault/recipes.js";
import { getFrontpageLabels } from "../../shared/i18n/index.js";

/**
 * @typedef {object} RecipeResultsTreeNode
 * @property {string} label Section title (folder name or localized root).
 * @property {Map<string, RecipeResultsTreeNode>} children Child folders keyed by segment name.
 * @property {any[]} pages Recipe page objects at this folder level.
 */

/**
 * Folder path segments under `Recipes/` (excluding the note filename).
 * @param {{ file: import("obsidian").TFile }} page
 * @returns {string[]}
 */
export function recipeResultsFolderSegments(page) {
    const file = page.file;
    const prefix = `${RECIPES_FOLDER}/`;
    if (!file.path.startsWith(prefix)) {
        return [];
    }
    const rel = file.path.slice(prefix.length);
    const parts = rel.split("/");
    parts.pop();
    parts.pop();
    return parts;
}

/**
 * @param {any[]} pages
 * @param {import("../../shared/i18n/language.js").AppLanguage} [lang]
 * @returns {RecipeResultsTreeNode}
 */
export function buildRecipeResultsTree(pages, lang = "en") {
    const rootLabel = getFrontpageLabels(lang).RECIPES_ROOT;
    /** @type {RecipeResultsTreeNode} */
    const root = { label: rootLabel, children: new Map(), pages: [] };

    for (const page of pages) {
        const segments = recipeResultsFolderSegments(page);
        let node = root;
        for (const seg of segments) {
            if (!node.children.has(seg)) {
                node.children.set(seg, { label: seg, children: new Map(), pages: [] });
            }
            node = node.children.get(seg);
        }
        node.pages.push(page);
    }

    return root;
}

/**
 * @param {Map<string, RecipeResultsTreeNode>} children
 * @returns {RecipeResultsTreeNode[]}
 */
export function sortedRecipeResultChildNodes(children) {
    return [...children.entries()]
        .sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: "base" }))
        .map(([, node]) => node);
}
