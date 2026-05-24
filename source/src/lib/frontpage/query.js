/**
 * Recipe listing and filter logic for the front page (Dataview-equivalent pipeline).
 */
import { convert } from "../../shared/startup/math-units.js";
import { FRONTPAGE_DEFAULT_MAX_DURATION_SEC, FrontpageFm } from "../../shared/constants/frontpage.js";
import { getIngredientRowsByName, sumRecipeAmountForName } from "../../shared/ingredients-utils.js";
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
    const coolMax = Number(get(FrontpageFm.FILTER_COOL_MAX_SEC));
    const freezeMax = Number(get(FrontpageFm.FILTER_FREEZE_MAX_SEC));

    const filterTags = Array.isArray(get(FrontpageFm.FILTER_TAGS)) ? get(FrontpageFm.FILTER_TAGS) : [];

    return {
        nMin: Number.isFinite(noteMin) ? noteMin : 0,
        nMax: Number.isFinite(noteMax) ? noteMax : 5,
        pMax: Number.isFinite(prepMax) ? prepMax : FRONTPAGE_DEFAULT_MAX_DURATION_SEC,
        cMax: Number.isFinite(cookMax) ? cookMax : FRONTPAGE_DEFAULT_MAX_DURATION_SEC,
        rMax: Number.isFinite(restMax) ? restMax : FRONTPAGE_DEFAULT_MAX_DURATION_SEC,
        coMax: Number.isFinite(coolMax) ? coolMax : FRONTPAGE_DEFAULT_MAX_DURATION_SEC,
        fMax: Number.isFinite(freezeMax) ? freezeMax : FRONTPAGE_DEFAULT_MAX_DURATION_SEC,
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

function hasIngredientName(ing, name) {
    return getIngredientRowsByName(ing, name).length > 0;
}

function checkTotalIngredientAmount(c, mb, ing, ingName) {
    const maxAmount = c.filterIngredientAmounts[ingName];
    if (maxAmount === "" || maxAmount == null) return true;
    const unit = c.filterIngredientUnits?.[ingName] ?? "";
    const total = sumRecipeAmountForName(ing, ingName, mb);
    if (total == null) return true;
    const filterAmount = convert(mb, unit, Number(maxAmount), ingName);
    if (!Number.isFinite(filterAmount)) return true;
    return total <= filterAmount;
}

function ingredientFilterPasses(ing, c, mb) {
    for (const [ingName, state] of Object.entries(c.filterIngredientStates)) {
        const hasRows = hasIngredientName(ing, ingName);
        if (!state || state === "allowed") {
            if (hasRows && !checkTotalIngredientAmount(c, mb, ing, ingName)) return false;
            continue;
        }
        if (state === "must_have") {
            if (!hasRows || !checkTotalIngredientAmount(c, mb, ing, ingName)) return false;
            continue;
        }
        if (state === "must_not_have") {
            if (hasRows) return false;
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
    const cool = Number(p.cool_duration);
    const freeze = Number(p.freeze_duration);
    const ps = Number.isFinite(prep) ? prep : 0;
    const cs = Number.isFinite(cook) ? cook : 0;
    const rsRest = Number.isFinite(rest) ? rest : 0;
    const rsCool = Number.isFinite(cool) ? cool : 0;
    const rsFreeze = Number.isFinite(freeze) ? freeze : 0;
    if (ps > c.pMax || cs > c.cMax || rsRest > c.rMax || rsCool > c.coMax || rsFreeze > c.fMax) return false;

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
