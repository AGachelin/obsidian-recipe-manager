import {
    DEFAULT_INGREDIENT_GROUP_ID,
    FRONTMATTER,
    FRONTMATTER_DEFAULTS,
} from "../../shared/constants/recipe.js";
import {
    listGroupsOrdered,
    listRowIdsForGroup,
    normalizeIngredientGroups,
} from "../../shared/ingredients-utils.js";

const LAST_ID = FRONTMATTER.INGREDIENTS_FIELDS.LAST_ID;
const GROUP_ID = FRONTMATTER.INGREDIENTS_FIELDS.GROUP_ID;
const ORDER = FRONTMATTER.INGREDIENTS_FIELDS.ORDER;

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * @param {unknown} groups
 * @param {Record<string, unknown>} ingredients
 */
export function createDefaultIngredientState(groups, ingredients) {
    return {
        groups: normalizeIngredientGroups(groups ?? FRONTMATTER_DEFAULTS[FRONTMATTER.INGREDIENT_GROUPS]),
        ingredients: clone(ingredients ?? FRONTMATTER_DEFAULTS[FRONTMATTER.INGREDIENTS]),
    };
}

/**
 * @param {Record<string, unknown>} ingredients
 * @param {string} groupId
 */
function nextRowOrder(ingredients, groupId) {
    const ids = listRowIdsForGroup(ingredients, groupId);
    if (ids.length === 0) return 0;
    let max = -1;
    for (const id of ids) {
        const o = Number(ingredients[id]?.[ORDER]);
        if (Number.isFinite(o) && o > max) max = o;
    }
    return max + 1;
}

/**
 * @param {{ id: string, label: string, order: number }[]} groups
 */
function nextGroupOrder(groups) {
    if (groups.length === 0) return 0;
    return Math.max(...groups.map((g) => g.order)) + 1;
}

/**
 * @param {Record<string, unknown>} ingredients
 * @param {string} groupId
 * @param {string} ingredientName
 */
export function addIngredientRow(ingredients, groupId, ingredientName) {
    const next = clone(ingredients);
    const lastId = Number(next[LAST_ID]) || 0;
    const newId = lastId + 1;
    next[LAST_ID] = newId;
    const gid = groupId || DEFAULT_INGREDIENT_GROUP_ID;
    next[String(newId)] = {
        id: newId,
        name: ingredientName,
        amount: 0,
        unit: "",
        [GROUP_ID]: gid,
        [ORDER]: nextRowOrder(next, gid),
    };
    return next;
}

/**
 * @param {{ id: string, label: string, order: number }[]} groups
 * @param {string} label
 */
export function addIngredientGroup(groups, label) {
    const list = normalizeIngredientGroups(groups);
    const base = String(label ?? "Group")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    let id = base || `group-${Date.now()}`;
    let n = 1;
    while (list.some((g) => g.id === id)) {
        id = `${base}-${n++}`;
    }
    list.push({ id, label: String(label ?? id), order: nextGroupOrder(list) });
    return list;
}

/**
 * @param {{ id: string, label: string, order: number }[]} groups
 * @param {string} groupId
 * @param {string} label
 */
export function renameIngredientGroup(groups, groupId, label) {
    return normalizeIngredientGroups(groups).map((g) =>
        g.id === groupId ? { ...g, label: String(label) } : g
    );
}

/**
 * @param {Record<string, unknown>} ingredients
 * @param {{ id: string, label: string, order: number }[]} groups
 * @param {string} groupId
 */
export function deleteIngredientGroup(ingredients, groups, groupId) {
    const list = normalizeIngredientGroups(groups);
    if (list.length <= 1) {
        return createDefaultIngredientState(null, null);
    }

    const nextIng = clone(ingredients);
    for (const key of Object.keys(nextIng)) {
        if (key === LAST_ID) continue;
        const row = nextIng[key];
        if (row && typeof row === "object" && String(row[GROUP_ID]) === String(groupId)) {
            delete nextIng[key];
        }
    }

    return {
        groups: list.filter((g) => g.id !== groupId),
        ingredients: nextIng,
    };
}

/**
 * @param {Record<string, unknown>} ingredients
 * @param {string} rowId
 */
export function deleteIngredientRow(ingredients, rowId) {
    const next = clone(ingredients);
    delete next[String(rowId)];
    return next;
}

/**
 * @param {*} mb
 * @param {string} path
 * @param {{ groups: unknown, ingredients: Record<string, unknown> }} state
 */
export function writeIngredientState(mb, path, state) {
    const groupsTarget = mb.parseBindTarget(FRONTMATTER.INGREDIENT_GROUPS, path);
    const ingTarget = mb.parseBindTarget(FRONTMATTER.INGREDIENTS, path);
    mb.setMetadata(groupsTarget, state.groups);
    mb.setMetadata(ingTarget, state.ingredients);
}

/**
 * @param {*} mb
 * @param {string} path
 * @param {string} groupId
 * @param {string} ingredientName
 * @param {unknown} groups
 * @param {Record<string, unknown>} ingredients
 */
export function persistAddIngredientRow(mb, path, groupId, ingredientName, groups, ingredients) {
    const nextIng = addIngredientRow(ingredients, groupId, ingredientName);
    writeIngredientState(mb, path, { groups: normalizeIngredientGroups(groups), ingredients: nextIng });
}
