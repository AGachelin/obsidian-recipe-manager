import { FRONTMATTER } from "./constants/recipe.js";

const LAST_ID = FRONTMATTER.INGREDIENTS_FIELDS.LAST_ID;

/**
 * Ingredient row ids in stable sort order (excludes `last_id`).
 * @param {Record<string, unknown>} [ingredients]
 * @returns {string[]}
 */
export function listIngredientIds(ingredients = {}) {
    return Object.keys(ingredients)
        .filter((id) => id !== LAST_ID)
        .sort();
}

/**
 * Canonical JSON for change detection (stable key order for row ids).
 * @param {Record<string, unknown>} [ingredients]
 */
export function ingredientsContentSignature(ingredients = {}) {
    const ids = listIngredientIds(ingredients);
    /** @type {Record<string, unknown>} */
    const payload = { [LAST_ID]: ingredients[LAST_ID] ?? 0 };
    for (const id of ids) {
        payload[id] = ingredients[id];
    }
    return JSON.stringify(payload);
}
