import { queryFilteredRecipes, filterRecipesInstant, recipeDisplayName } from "../../lib/frontpage/query.js";
import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";

/**
 * Stateless table paint + asynchronous server-side filter query (Dataview/cache).
 */
export class FrontpageRecipeResultsPanel {
    /**
     * @param {string} path Front page note path (for Markdown link context).
     */
    constructor(path) {
        this.path = path;
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
                text: 'No recipes match the advanced filters. Adjust filters and click "Apply advanced filters".',
            });
            return;
        }
        if (filtered.length === 0) {
            this.tableHost.createEl("p", {
                cls: FRONTPAGE_LAYOUT.empty,
                text: "No recipes match the recipe name or ingredient text filter.",
            });
            return;
        }

        const table = this.tableHost.createEl("table", { cls: FRONTPAGE_LAYOUT.table });
        const trh = table.createEl("thead").createEl("tr");
        trh.createEl("th", { text: "Recipe" });
        trh.createEl("th", { text: "Rating" });
        const tbody = table.createEl("tbody");

        const pathCtx = this.path;
        for (const p of filtered) {
            const tr = tbody.createEl("tr");
            const tdName = tr.createEl("td", { cls: FRONTPAGE_LAYOUT.cellName });
            const tdRate = tr.createEl("td", { cls: FRONTPAGE_LAYOUT.cellRating });
            const file = p.file;
            const n = p.note;
            tdRate.textContent = Number.isFinite(Number(n)) ? String(n) : "—";
            mb.mb.internal.renderMarkdown(`[[${file.path}|${recipeDisplayName(p)}]]`, tdName, pathCtx);
        }
    }
}
