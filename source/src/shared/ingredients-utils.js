import { FRONTMATTER } from "./constants/recipe.js";

const LAST_ID = FRONTMATTER.INGREDIENTS_FIELDS.LAST_ID;

function idSortKey(a, b) {
    const na = Number(a);
    const nb = Number(b);
    if (Number.isFinite(na) && Number.isFinite(nb) && String(na) === a && String(nb) === b) {
        return na - nb;
    }
    return a.localeCompare(b);
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
    };
}

export function bindIngredientMemory(mb, recipePath, id, leaf) {
    return mb.parseBindTarget(`memory^ingredients["${id}"]["${leaf}"]`, recipePath);
}

export function ingredientsContentSignature(ingredients = {}) {
    const ids = listIngredientIds(ingredients);
    const payload = { [LAST_ID]: ingredients[LAST_ID] ?? 0 };
    for (const id of ids) {
        payload[id] = ingredients[id];
    }
    return JSON.stringify(payload);
}
