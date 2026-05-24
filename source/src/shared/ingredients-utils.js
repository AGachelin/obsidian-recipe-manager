import { DEFAULT_INGREDIENT_GROUP_ID, FRONTMATTER } from "./constants/recipe.js";
import { convert } from "./startup/math-units.js";

const LAST_ID = FRONTMATTER.INGREDIENTS_FIELDS.LAST_ID;
const GROUP_ID = FRONTMATTER.INGREDIENTS_FIELDS.GROUP_ID;
const ORDER = FRONTMATTER.INGREDIENTS_FIELDS.ORDER;

function idSortKey(a, b) {
    const na = Number(a);
    const nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb) && String(na) === a && String(nb) === b) {
        return na - nb;
    }
    return a.localeCompare(b);
}

function orderSortKey(a, b) {
    const oa = Number(a?.[ORDER]);
    const ob = Number(b?.[ORDER]);
    const na = Number.isFinite(oa) ? oa : 0;
    const nb = Number.isFinite(ob) ? ob : 0;
    if (na !== nb) return na - nb;
    return idSortKey(String(a?.id ?? ""), String(b?.id ?? ""));
}

/**
 * @param {unknown} groups
 * @returns {{ id: string, label: string, order: number }[]}
 */
export function normalizeIngredientGroups(groups) {
    if (!Array.isArray(groups) || groups.length === 0) {
        return [{ id: DEFAULT_INGREDIENT_GROUP_ID, label: "Ingredients", order: 0 }];
    }
    return groups
        .map((g, i) => ({
            id: String(g?.id ?? DEFAULT_INGREDIENT_GROUP_ID),
            label: String(g?.label ?? g?.id ?? "Ingredients"),
            order: Number.isFinite(Number(g?.order)) ? Number(g.order) : i,
        }))
        .sort((a, b) => a.order - b.order);
}

/**
 * @param {{ id: string, label: string, order: number }[]} groups
 */
export function listGroupsOrdered(groups) {
    return normalizeIngredientGroups(groups);
}

export function listIngredientIds(ingredients = {}) {
    return Object.keys(ingredients).filter((id) => id !== LAST_ID).sort(idSortKey);
}

export function listReadableIngredientIds(ingredients = {}) {
    return listIngredientIds(ingredients).filter((id) => {
        const ing = ingredients[id] || {};
        const rawName = String(ing.name != null ? ing.name : "").trim();
        const amt = Number(ing.amount);
        const hasAmount = Number.isFinite(amt) && amt > 0;
        return rawName.length > 0 || hasAmount;
    });
}

export function hasReadableIngredients(ingredients = {}) {
    return listReadableIngredientIds(ingredients).length > 0;
}

export function ingredientEntry(ingredients, id) {
    const ing = ingredients[id] || {};
    return {
        name: ing.name || "ingredient",
        amount: ing.amount ?? 0,
        unit: ing.unit ?? "",
        group_id: ing[GROUP_ID] ?? DEFAULT_INGREDIENT_GROUP_ID,
        order: Number.isFinite(Number(ing[ORDER])) ? Number(ing[ORDER]) : 0,
    };
}

/**
 * @param {Record<string, unknown>} ingredients
 * @param {string} groupId
 */
export function listRowIdsForGroup(ingredients, groupId) {
    const gid = groupId || DEFAULT_INGREDIENT_GROUP_ID;
    return listIngredientIds(ingredients)
        .filter((id) => {
            const row = ingredients[id];
            const rowGroup = row?.[GROUP_ID] ?? DEFAULT_INGREDIENT_GROUP_ID;
            return String(rowGroup) === String(gid);
        })
        .sort((ida, idb) => orderSortKey(ingredients[ida], ingredients[idb]));
}

/**
 * Ingredient names already present in a group (used to hide them from that group's picker).
 *
 * @param {Record<string, unknown>} ingredients
 * @param {string} groupId
 * @returns {string[]}
 */
export function listIngredientNamesForGroup(ingredients, groupId) {
    return listRowIdsForGroup(ingredients, groupId)
        .map((id) => String(ingredientEntry(ingredients, id).name ?? "").trim())
        .filter(Boolean);
}

export function bindIngredientMemory(mb, recipePath, id, leaf) {
    return mb.parseBindTarget(`memory^ingredients["${id}"]["${leaf}"]`, recipePath);
}

export function* iterIngredientRows(ing) {
    if (!ing || typeof ing !== "object") return;
    for (const [key, row] of Object.entries(ing)) {
        if (key === LAST_ID) continue;
        if (row && typeof row === "object") yield row;
    }
}

/**
 * @param {Record<string, unknown>} ing
 * @param {string} name
 */
export function getIngredientRowsByName(ing, name) {
    const nameLC = String(name).toLowerCase();
    const rows = [];
    for (const row of iterIngredientRows(ing)) {
        if (String(row.name ?? "").toLowerCase() === nameLC) {
            rows.push(row);
        }
    }
    return rows;
}

/**
 * Sum recipe amounts for an ingredient name (canonical units via convert).
 *
 * @param {Record<string, unknown>} ing
 * @param {string} name
 * @param {*} mb Meta Bind API
 * @param {string} [targetUnit] filter unit; empty uses each row's unit in canonical sum via convert to filter unit
 */
/** Sum row amounts in canonical units (grams / ml basis via convert). */
export function sumRecipeAmountForName(ing, name, mb) {
    const rows = getIngredientRowsByName(ing, name);
    if (rows.length === 0) return null;

    let total = 0;
    let any = false;

    for (const row of rows) {
        const amount = Number(row.amount);
        if (!Number.isFinite(amount) || amount <= 0) continue;
        const rowUnit = String(row.unit ?? "");
        const canonical = convert(mb, rowUnit, amount, name);
        if (Number.isFinite(canonical)) {
            total += canonical;
            any = true;
        }
    }

    return any ? total : null;
}

/**
 * @param {Record<string, unknown>} ingredients
 * @param {unknown} groups
 */
export function ingredientsContentSignature(ingredients = {}, groups = null) {
    const ids = listIngredientIds(ingredients);
    const payload = {
        groups: normalizeIngredientGroups(groups),
        [LAST_ID]: ingredients[LAST_ID] ?? 0,
    };
    for (const id of ids) {
        payload[id] = ingredients[id];
    }
    return JSON.stringify(payload);
}
