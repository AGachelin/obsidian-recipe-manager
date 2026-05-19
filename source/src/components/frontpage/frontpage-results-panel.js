import { queryFilteredRecipes, filterRecipesInstant, recipeDisplayName } from "../../lib/frontpage/query.js";
import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";
import { getFrontpageLabels } from "../../shared/i18n/index.js";
import { mountCollapsibleSection } from "./collapsible-sections.js";
import { mountStarRating } from "../shared/star-rating.js";
import { recipeResultsGroupLabel, resolveRecipeThumbnailUrl } from "../../shared/vault/recipes.js";

/**
 * Stateless table paint + asynchronous server-side filter query (Dataview/cache).
 */
export class FrontpageRecipeResultsPanel {
    /**
     * @param {string} path Front page note path (for Markdown link context).
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     */
    constructor(path, lang) {
        this.path = path;
        this.lang = lang;
        this.L = getFrontpageLabels(lang);
        /** @type {import("obsidian").App | null} */
        this.app = null;
        /** @type {HTMLElement | null} */
        this.tableHost = null;
        /** @type {HTMLInputElement | null} */
        this.recipeNameInput = null;
        /** @type {HTMLElement | null} */
        this.countEl = null;
        /** @type {() => string} */
        this.getIngredientNeedle = () => "";
        /** @type {any[]} */
        this.appliedRecipes = [];
    }

    /**
     * @param {{ tableHost: HTMLElement, recipeNameInput: HTMLInputElement, countEl: HTMLElement }} refs
     */
    attachDom(refs) {
        this.tableHost = refs.tableHost;
        this.recipeNameInput = refs.recipeNameInput;
        this.countEl = refs.countEl;
    }

    /** @param {import("obsidian").App} app */
    setApp(app) {
        this.app = app;
    }

    /** @param {() => string} supplier */
    setIngredientNeedleSupplier(supplier) {
        this.getIngredientNeedle = supplier;
    }

    /** @param {string} needle */
    setIngredientNeedle(needle) {
        this.getIngredientNeedle = () => needle;
    }

    /** @returns {Promise<void>} */
    async runAdvancedQuery(mb, app) {
        this.setApp(app);
        this.appliedRecipes = await queryFilteredRecipes(app, mb, this.path);
        await this.paint(mb);
    }

    /** @returns {Promise<void>} */
    async paint(mb) {
        if (!this.tableHost || !this.countEl || !this.recipeNameInput) return;

        this.tableHost.empty();
        const ingNeedle = this.getIngredientNeedle();
        const filtered = filterRecipesInstant(this.appliedRecipes, this.recipeNameInput.value, ingNeedle);
        this.countEl.textContent = `${filtered.length} / ${this.appliedRecipes.length}`;

        if (this.appliedRecipes.length === 0) {
            this.tableHost.createEl("p", {
                cls: FRONTPAGE_LAYOUT.empty,
                text: this.L.EMPTY_ADVANCED,
            });
            return;
        }
        if (filtered.length === 0) {
            this.tableHost.createEl("p", {
                cls: FRONTPAGE_LAYOUT.empty,
                text: this.L.EMPTY_INSTANT,
            });
            return;
        }

        const groups = new Map();
        for (const page of filtered) {
            const label = recipeResultsGroupLabel(page, recipeDisplayName, this.lang);
            if (!groups.has(label)) {
                groups.set(label, []);
            }
            groups.get(label).push(page);
        }

        const sortedLabels = [...groups.keys()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
        const host = this.tableHost.createDiv({ cls: FRONTPAGE_LAYOUT.resultsGroups });
        const pathCtx = this.path;
        const app = this.app;

        for (const label of sortedLabels) {
            const pages = groups.get(label).slice().sort((a, b) =>
                recipeDisplayName(a).localeCompare(recipeDisplayName(b), undefined, { sensitivity: "base" })
            );
            const content = mountCollapsibleSection(host, label, true);
            const table = content.createEl("table", { cls: FRONTPAGE_LAYOUT.table });
            const trh = table.createEl("thead").createEl("tr");
            trh.createEl("th", { text: "" });
            trh.createEl("th", { text: this.L.TABLE_RECIPE });
            trh.createEl("th", { text: this.L.TABLE_RATING });
            const tbody = table.createEl("tbody");

            for (const p of pages) {
                const tr = tbody.createEl("tr");
                const tdThumb = tr.createEl("td", { cls: FRONTPAGE_LAYOUT.cellThumb });
                const tdName = tr.createEl("td", { cls: FRONTPAGE_LAYOUT.cellName });
                const tdRate = tr.createEl("td", { cls: FRONTPAGE_LAYOUT.cellRating });
                const file = p.file;

                if (app) {
                    const thumbUrl = resolveRecipeThumbnailUrl(app, pathCtx, p.thumbnail);
                    if (thumbUrl) {
                        tdThumb.createEl("img", {
                            cls: "live__thumb-img",
                            attr: { src: thumbUrl, alt: "", loading: "lazy" },
                        });
                    }
                }

                mountStarRating(tdRate, p.note);
                mb.mb.internal.renderMarkdown(`[[${file.path}|${recipeDisplayName(p)}]]`, tdName, pathCtx);
            }
        }
    }
}
