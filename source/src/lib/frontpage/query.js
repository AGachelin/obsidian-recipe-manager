/**
 * Recipe listing and filter logic for the front page (Dataview-equivalent pipeline).
 */
import { convert } from "../../shared/startup/math-units.js";
import { FRONTPAGE_DEFAULT_MAX_DURATION_SEC, FrontpageFm } from "../../shared/constants/frontpage.js";
import {
    RECIPES_FOLDER,
    iterIngredientRows,
    listRecipeMarkdownFiles,
    recipePageFromFile,
} from "../../shared/vault/recipes.js";

/**
 * @param {*} mb
 * @param {string} path
 */
export function readFilterCriteria(mb, path) {
    const at = (k) => mb.parseBindTarget(k, path);
    const get = (k) => mb.getMetadata(at(k));

    const noteMin = Number(get(FrontpageFm.FILTER_NOTE_MIN));
    const noteMax = Number(get(FrontpageFm.FILTER_NOTE_MAX));
    const prepMax = Number(get(FrontpageFm.FILTER_PREP_MAX_SEC));
    const cookMax = Number(get(FrontpageFm.FILTER_COOK_MAX_SEC));
    const restMax = Number(get(FrontpageFm.FILTER_REST_MAX_SEC));

    const filterTags = Array.isArray(get(FrontpageFm.FILTER_TAGS)) ? get(FrontpageFm.FILTER_TAGS) : [];

    return {
        nMin: Number.isFinite(noteMin) ? noteMin : 0,
        nMax: Number.isFinite(noteMax) ? noteMax : 5,
        pMax: Number.isFinite(prepMax) ? prepMax : FRONTPAGE_DEFAULT_MAX_DURATION_SEC,
        cMax: Number.isFinite(cookMax) ? cookMax : FRONTPAGE_DEFAULT_MAX_DURATION_SEC,
        rMax: Number.isFinite(restMax) ? restMax : FRONTPAGE_DEFAULT_MAX_DURATION_SEC,
        srcQ: String(get(FrontpageFm.FILTER_SOURCE_SUBSTR) ?? "")
            .toLowerCase()
            .trim(),
        normFilterTags: [
            ...new Set(
                filterTags
                    .map((t) => String(t).toLowerCase().replace(/^#/, "").trim())
                    .filter(Boolean)
            ),
        ],
        filterIngredientStates: Object.assign({}, get(FrontpageFm.FILTER_INGREDIENTS_STATE) ?? {}),
        filterIngredientAmounts: Object.assign({}, get(FrontpageFm.FILTER_INGREDIENTS_AMOUNT) ?? {}),
        filterIngredientUnits: Object.assign({}, get(FrontpageFm.FILTER_INGREDIENTS_UNIT) ?? {}),
    };
}

function recipeTagSet(p) {
    const set = new Set();
    const yaml = p.tags ?? p.file?.frontmatter?.tags;
    const fromYaml = Array.isArray(yaml) ? yaml : [];
    const fileTags = p.file?.tags ?? [];
    for (const t of [...fromYaml, ...fileTags]) {
        const s = String(t).toLowerCase().replace(/^#/, "").trim();
        if (s) set.add(s);
    }
    return set;
}

function findIngredientByName(ing, name) {
    const nameLC = String(name).toLowerCase();
    for (const row of iterIngredientRows(ing)) {
        if (String(row.name ?? "").toLowerCase() === nameLC) {
            return row;
        }
    }
    return null;
}

function ingredientFilterPasses(ing, c, mb) {
    for (const [ingName, state] of Object.entries(c.filterIngredientStates)) {
        if (!state || state === "allowed") continue;

        const ingRow = findIngredientByName(ing, ingName);

        if (state === "must_have") {
            if (!ingRow) return false;
            const minAmount = c.filterIngredientAmounts[ingName];
            const unit = c.filterIngredientUnits?.[ingName] ?? "";
            if (minAmount !== "" && minAmount != null) {
                if (!ingRow.amount) {
                    continue;
                }
                const recipeAmount = Number(ingRow.amount);
                const filterAmount = convert(mb, unit, Number(minAmount), ingName);
                if (Number.isFinite(recipeAmount) && Number.isFinite(filterAmount)) {
                    if (recipeAmount < filterAmount) return false;
                }
            }
        } else if (state === "must_not_have") {
            if (ingRow) return false;
        }
    }
    return true;
}

function passesCriteria(p, c, mb) {
    if (!p.ingredients) return false;

    const n = Number(p.note);
    const v = Number.isFinite(n) ? n : 0;
    if (v < c.nMin || v > c.nMax) return false;

    const prep = Number(p.prep_duration);
    const cook = Number(p.cook_duration);
    const rest = Number(p.rest_duration);
    const ps = Number.isFinite(prep) ? prep : 0;
    const cs = Number.isFinite(cook) ? cook : 0;
    const rsRest = Number.isFinite(rest) ? rest : 0;
    if (ps > c.pMax || cs > c.cMax || rsRest > c.rMax) return false;

    if (c.srcQ && !String(p.source ?? "").toLowerCase().includes(c.srcQ)) return false;

    if (c.normFilterTags.length > 0) {
        const recipeTags = recipeTagSet(p);
        for (const ft of c.normFilterTags) {
            if (!recipeTags.has(ft)) return false;
        }
    }

    if (!ingredientFilterPasses(p.ingredients, c, mb)) return false;
    return true;
}

/**
 * @param {import("obsidian").App} app
 * @param {*} mb
 * @param {string} path
 * @returns {Promise<any[]>}
 */
export async function queryFilteredRecipes(app, mb, path) {
    const c = readFilterCriteria(mb, path);
    const dvPlugin = app.plugins.plugins?.dataview ?? app.plugins.plugins?.["obsidian-dataview"];
    const api = dvPlugin?.api;

    /** @type {any[]} */
    let candidates = [];
    let usedDv = false;

    if (api?.pages) {
        try {
            const pages = api
                .pages(`"${RECIPES_FOLDER}"`)
                .where((p) => p.file.path.startsWith(RECIPES_FOLDER))
                .where((p) => p.file.name.toLowerCase() !== "content.md")
                .where((p) => p.ingredients != null);
            candidates = Array.from(pages);
            usedDv = true;
        } catch {
            usedDv = false;
        }
    }

    if (!usedDv) {
        candidates = listRecipeMarkdownFiles(app).map((f) => recipePageFromFile(app, f));
    }

    const out = [];
    for (const p of candidates) {
        if (!passesCriteria(p, c, mb)) continue;
        out.push(p);
    }

    out.sort((a, b) =>
        String(a.file?.name ?? "").localeCompare(String(b.file?.name ?? ""), undefined, { sensitivity: "base" })
    );
    return out;
}

/**
 * @param {any} p
 */
export function recipeDisplayName(p) {
    const n = p.file?.name ?? "";
    return String(n).replace(/\.md$/i, "");
}

/**
 * @param {any[]} recipes
 * @param {string} recipeNameNeedle
 * @param {string} ingredientNeedle
 */
export function filterRecipesInstant(recipes, recipeNameNeedle, ingredientNeedle) {
    const rN = String(recipeNameNeedle ?? "").trim().toLowerCase();
    const iN = String(ingredientNeedle ?? "").trim().toLowerCase();

    return recipes.filter((p) => {
        if (rN && !recipeDisplayName(p).toLowerCase().includes(rN)) return false;
        if (!iN) return true;
        for (const row of iterIngredientRows(p.ingredients)) {
            if (String(row.name ?? "").toLowerCase().includes(iN)) return true;
        }
        return false;
    });
}
