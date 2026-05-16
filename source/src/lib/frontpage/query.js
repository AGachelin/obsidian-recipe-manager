/**
 * Recipe listing and filter logic for the front page (Dataview-equivalent pipeline).
 * Uses the Dataview plugin API when available (`api.pages`), otherwise falls back to the vault + metadata cache.
 */
import { convert } from "../../shared/startup/math-units.js";
import { FRONTPAGE_DEFAULT_MAX_DURATION_SEC } from "../../shared/constants/frontpage.js";

/**
 * @param {*} mb
 * @param {string} path
 */
export function readFilterCriteria(mb, path) {
    const at = (k) => mb.parseBindTarget(k, path);
    const get = (k) => mb.getMetadata(at(k));

    const noteMin = Number(get("filter_note_min"));
    const noteMax = Number(get("filter_note_max"));
    const prepMax = Number(get("filter_prep_max_sec"));
    const cookMax = Number(get("filter_cook_max_sec"));
    const restMax = Number(get("filter_rest_max_sec"));

    const filterTags = Array.isArray(get("filter_tags")) ? get("filter_tags") : [];

    return {
        nMin: Number.isFinite(noteMin) ? noteMin : 0,
        nMax: Number.isFinite(noteMax) ? noteMax : 5,
        pMax: Number.isFinite(prepMax) ? prepMax : FRONTPAGE_DEFAULT_MAX_DURATION_SEC,
        cMax: Number.isFinite(cookMax) ? cookMax : FRONTPAGE_DEFAULT_MAX_DURATION_SEC,
        rMax: Number.isFinite(restMax) ? restMax : FRONTPAGE_DEFAULT_MAX_DURATION_SEC,
        srcQ: String(get("filter_source_substr") ?? "")
            .toLowerCase()
            .trim(),
        normFilterTags: [
            ...new Set(
                filterTags
                    .map((t) => String(t).toLowerCase().replace(/^#/, "").trim())
                    .filter(Boolean)
            ),
        ],
        filterIngredientStates: Object.assign({}, get("filter_ingredients_state") ?? {}),
        filterIngredientAmounts: Object.assign({}, get("filter_ingredients_amount") ?? {}),
        filterIngredientUnits: Object.assign({}, get("filter_ingredients_unit") ?? {}),
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

function iterIngredientRows(ing) {
    if (!ing || typeof ing !== "object") return [];
    return Object.entries(ing)
        .filter(([k]) => k !== "last_id")
        .map(([, row]) => row)
        .filter((row) => row && typeof row === "object");
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
                    return true;
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
 * @returns {import("obsidian").TFile[]}
 */
function listRecipeFiles(app) {
    return app.vault.getMarkdownFiles().filter(
        (f) => f.path.startsWith("Recipes/") && f.name.toLowerCase() !== "content.md"
    );
}

/**
 * Build a Dataview-shaped page object from cache (fallback path).
 * @param {import("obsidian").App} app
 * @param {import("obsidian").TFile} file
 */
function pageFromFile(app, file) {
    const fm = app.metadataCache.getCache(file)?.frontmatter ?? {};
    return {
        file,
        note: fm.note,
        prep_duration: fm.prep_duration,
        cook_duration: fm.cook_duration,
        rest_duration: fm.rest_duration,
        source: fm.source,
        tags: fm.tags,
        ingredients: fm.ingredients,
    };
}

/**
 * Query recipes equivalent to Dataview `dv.pages('"Recipes"').where(...)`.
 *
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
                .pages('"Recipes"')
                .where((p) => p.file.path.startsWith("Recipes"))
                .where((p) => p.file.name.toLowerCase() !== "content.md")
                .where((p) => p.ingredients != null);
            candidates = Array.from(pages);
            usedDv = true;
        } catch {
            usedDv = false;
        }
    }

    if (!usedDv) {
        candidates = listRecipeFiles(app).map((f) => pageFromFile(app, f));
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
 * Client-side filter: recipe basename + optional substring match on any ingredient name.
 *
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
