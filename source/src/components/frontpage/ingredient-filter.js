import { buildUnitSelectDeclarationArguments } from "../../shared/constants/custom-units.js";
import {
    attachIngredientCatalogInvalidation,
    getIngredientCatalog,
    refreshIngredientCatalog,
} from "../../shared/vault/ingredient-catalog.js";
import {
    FrontpageFm,
    ingredientFilterAmountBindKey,
    ingredientFilterStateBindKey,
    ingredientFilterUnitBindKey,
} from "../../shared/constants/frontpage.js";
import { INGREDIENT_FILTER_LAYOUT } from "../../shared/constants/frontpage-ui.js";
import { UI_CLASSES } from "../../shared/constants/ui.js";
import { getFrontpageLabels, getIngredientFilterStateLabels } from "../../shared/i18n/index.js";
import { mountIngredientCatalogTree } from "../shared/ingredient-catalog-tree-mount.js";
import { InputConfig } from "../config/input-config.js";
import { ButtonConfig } from "../config/button-config.js";

const FILTER_STATES = Object.freeze({
    ALLOWED: "allowed",
    MUST_HAVE: "must_have",
    MUST_NOT_HAVE: "must_not_have",
});

const STATE_CYCLE = [FILTER_STATES.ALLOWED, FILTER_STATES.MUST_HAVE, FILTER_STATES.MUST_NOT_HAVE];

export class IngredientFilter {
    /**
     * @param {string} path
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     */
    constructor(path, lang) {
        this.path = path;
        this.lang = lang;
        this.L = getFrontpageLabels(lang);
        this.stateLabels = getIngredientFilterStateLabels(lang);
        this.isGenerated = false;
        this.containerEl = null;
        this.listEl = null;
        /** @type {HTMLInputElement | null} */
        this.searchInputEl = null;
        this.mb = null;
        this._searchDebounce = null;
    }

    /**
     * @param {*} mb
     */
    async generate(mb) {
        this.isGenerated = true;
        this.mb = mb;
        attachIngredientCatalogInvalidation(mb.mb.app);
        getIngredientCatalog(mb.mb.app);
    }

    async reloadIngredientNames(mb) {
        refreshIngredientCatalog(mb.mb.app);
    }

    /**
     * Gets the current state of an ingredient
     * @param {*} mb
     * @param {string} ingredientName
     * @returns {string}
     */
    getIngredientState(mb, ingredientName) {
        try {
            const bt = mb.parseBindTarget(ingredientFilterStateBindKey(ingredientName), this.path);
            const state = mb.getMetadata(bt) || FILTER_STATES.ALLOWED;
            return STATE_CYCLE.includes(state) ? state : FILTER_STATES.ALLOWED;
        } catch {
            return FILTER_STATES.ALLOWED;
        }
    }

    /**
     * @param {*} mb
     * @param {import("obsidian").Component} component
     * @param {HTMLElement} parent
     * @param {{ onSearchChange?: () => void }} [options]
     */
    async mount(mb, component, parent, options = {}) {
        if (!this.isGenerated) {
            await this.generate(mb);
        }

        this.mb = mb;
        this._onSearchChange = typeof options.onSearchChange === "function" ? options.onSearchChange : null;
        parent.empty();
        const containerEl = parent.createEl("div", { cls: INGREDIENT_FILTER_LAYOUT.container });
        this.containerEl = containerEl;

        const headerEl = containerEl.createEl("div", { cls: INGREDIENT_FILTER_LAYOUT.header });

        const searchWrap = headerEl.createEl("div", { cls: INGREDIENT_FILTER_LAYOUT.searchWrap });
        this.searchInputEl = searchWrap.createEl("input", {
            type: "text",
            cls: INGREDIENT_FILTER_LAYOUT.searchInput,
            attr: { placeholder: this.L.INGREDIENT_FILTER_PLACEHOLDER, spellcheck: "false" },
        });
        const searchBt = mb.parseBindTarget(FrontpageFm.FILTER_INGREDIENTS_SEARCH, this.path);
        const v = mb.getMetadata(searchBt);
        if (v != null && String(v).length > 0) {
            this.searchInputEl.value = String(v);
        }
        this.searchInputEl.addEventListener("input", () => {
            window.clearTimeout(this._searchDebounce);
            this._searchDebounce = window.setTimeout(() => {
                void this.refreshList(mb, component);
                try {
                    this._onSearchChange?.();
                } catch {
                    /* ignore */
                }
            }, 80);
        });

        const resetButtonConfig = new ButtonConfig("reset-ingredient-filter", this.L.INGREDIENT_FILTER_RESET);
        resetButtonConfig.addUpdateMetadataAction(FrontpageFm.FILTER_INGREDIENTS_STATE, "Object.create(null)");
        const resetButton = mb.createButtonMountable(this.path, resetButtonConfig.render(false));
        const resetMount = headerEl.createEl("div", { cls: INGREDIENT_FILTER_LAYOUT.resetWrap });
        mb.wrapInMDRC(resetButton, resetMount, component);

        this.listEl = containerEl.createEl("div", { cls: INGREDIENT_FILTER_LAYOUT.list });
        await this.refreshList(mb, component);
    }

    async refreshList(mb, component) {
        if (!this.listEl) return;

        const searchNeedle = String(this.searchInputEl?.value ?? "");
        const app = mb.mb.app;
        let any = false;

        mountIngredientCatalogTree(this.listEl, app, this.lang, searchNeedle, (ingredientName, leafParent) => {
            any = true;
            const state = this.getIngredientState(mb, ingredientName);
            this.renderIngredientRow(mb, component, leafParent, ingredientName, state);
        });

        if (!any) {
            this.listEl.createEl("p", {
                text: this.L.INGREDIENT_FILTER_EMPTY,
                cls: INGREDIENT_FILTER_LAYOUT.empty,
            });
        }
    }

    /**
     * Renders a single ingredient row
     * @param {*} mb
     * @param {import("obsidian").Component} component
     * @param {HTMLElement} listEl
     * @param {string} ingredientName
     * @param {string} state
     */
    renderIngredientRow(mb, component, listEl, ingredientName, state) {
        const rowEl = listEl.createEl("div", { cls: INGREDIENT_FILTER_LAYOUT.row });

        const buttonId = `filter-state-${ingredientName.replace(/[^a-z0-9]/gi, "-")}`;
        const stateButtonConfig = new ButtonConfig(buttonId, this.stateLabels[state] || state);
        stateButtonConfig.addUpdateMetadataAction(
            ingredientFilterStateBindKey(ingredientName),
            `(() => {
                    const current = x || "${FILTER_STATES.ALLOWED}";
                    const states = ${JSON.stringify(STATE_CYCLE)};
                    const idx = states.indexOf(current);
                    return states[(idx + 1) % states.length];
                })()`
        );
        const stateButton = mb.createButtonMountable(this.path, stateButtonConfig.render(false));
        const stateMount = rowEl.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
        mb.wrapInMDRC(stateButton, stateMount, component);

        rowEl.createEl("span", { text: ingredientName, cls: INGREDIENT_FILTER_LAYOUT.name });

        if (state !== FILTER_STATES.MUST_NOT_HAVE) {
            const amountConfig = new InputConfig(
                "text",
                mb.parseBindTarget(ingredientFilterAmountBindKey(ingredientName), this.path),
                "inline",
                [{ name: "placeholder", value: [this.L.MAX_AMOUNT_PLACEHOLDER] }]
            ).render();
            const amountInput = mb.createInputFieldMountable(this.path, amountConfig);
            const amountMount = rowEl.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
            mb.wrapInMDRC(amountInput, amountMount, component);

            const unitConfig = new InputConfig(
                "inlineSelect",
                mb.parseBindTarget(ingredientFilterUnitBindKey(ingredientName), this.path),
                "inline",
                buildUnitSelectDeclarationArguments()
            ).render();
            const unitSelect = mb.createInputFieldMountable(this.path, unitConfig);
            const unitMount = rowEl.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
            mb.wrapInMDRC(unitSelect, unitMount, component);
        }
    }
}
