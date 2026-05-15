import { UNIT_OPTIONS, UNIT_LABELS } from "../../shared/constants/custom_units.js";
import { UI_CLASSES } from "../../shared/constants/ui.js";
import { InputConfig } from "../config/input-config.js";

const FILTER_STATES = Object.freeze({
    ALLOWED: "allowed",
    MUST_HAVE: "must_have",
    MUST_NOT_HAVE: "must_not_have",
});

const STATE_LABELS = Object.freeze({
    [FILTER_STATES.ALLOWED]: "Allowed",
    [FILTER_STATES.MUST_HAVE]: "Must have",
    [FILTER_STATES.MUST_NOT_HAVE]: "Must not have",
});

const STATE_CYCLE = [FILTER_STATES.ALLOWED, FILTER_STATES.MUST_HAVE, FILTER_STATES.MUST_NOT_HAVE];

export class IngredientFilter {
    constructor(path) {
        this.path = path;
        this.isGenerated = false;
        this.containerEl = null;
        this.listEl = null;
        /** @type {HTMLInputElement | null} */
        this.searchInputEl = null;
        this.allIngredients = [];
        this.mb = null;
        this._searchDebounce = null;
    }

    /**
     * Collects all unique ingredient names from all recipe files in the vault.
     * @param {*} mb
     * @returns {Promise<string[]>}
     */
    async collectAllIngredients(mb) {
        try {
            const app = mb.mb.app;
            const allIngredients = new Set();

            // Get all recipe files
            const recipeFolder = app.vault.getAbstractFileByPath("Recipes");
            if (!recipeFolder || !recipeFolder.children) return [];

            const iterateFolder = (folder) => {
                if (!folder.children) return;
                for (const file of folder.children) {
                    if (file.children) {
                        // It's a folder
                        iterateFolder(file);
                    } else if (file.extension === "md") {
                        // It's a markdown file
                        const cache = app.metadataCache.getFileCache(file);
                        if (cache?.frontmatter?.ingredients) {
                            const ingredients = cache.frontmatter.ingredients;
                            if (typeof ingredients === "object") {
                                for (const [id, ing] of Object.entries(ingredients)) {
                                    if (id !== "last_id" && ing && ing.name) {
                                        allIngredients.add(String(ing.name).trim());
                                    }
                                }
                            }
                        }
                    }
                }
            };

            iterateFolder(recipeFolder);
            return Array.from(allIngredients).sort((a, b) => a.localeCompare(b));
        } catch (e) {
            console.error("Error collecting ingredients:", e);
            return [];
        }
    }

    /**
     * @param {*} mb
     */
    async generate(mb) {
        this.isGenerated = true;
        this.mb = mb;

        // Collect all ingredients from recipes
        this.allIngredients = await this.collectAllIngredients(mb);
    }

    /**
     * Cycles the state of an ingredient filter
     * @param {*} mb
     * @param {string} ingredientName
     */
    async cycleIngredientState(mb, ingredientName) {
        const stateKey = `filter_ingredients_state["${ingredientName}"]`;
        const bt = mb.parseBindTarget(stateKey, this.path);

        // Get current state
        let current = mb.getMetadata(bt) || FILTER_STATES.ALLOWED;
        if (!STATE_CYCLE.includes(current)) {
            current = FILTER_STATES.ALLOWED;
        }

        // Cycle to next state
        const idx = STATE_CYCLE.indexOf(current);
        const next = STATE_CYCLE[(idx + 1) % STATE_CYCLE.length];

        mb.setMetadata(bt, next);
    }

    /**
     * Gets the current state of an ingredient
     * @param {*} mb
     * @param {string} ingredientName
     * @returns {string}
     */
    getIngredientState(mb, ingredientName) {
        try {
            const stateKey = `filter_ingredients_state["${ingredientName}"]`;
            const bt = mb.parseBindTarget(stateKey, this.path);
            const state = mb.getMetadata(bt) || FILTER_STATES.ALLOWED;
            return STATE_CYCLE.includes(state) ? state : FILTER_STATES.ALLOWED;
        } catch (e) {
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
        const containerEl = parent.createEl("div", { cls: "ingredient-filter-container" });
        this.containerEl = containerEl;

        const headerEl = containerEl.createEl("div", { cls: "ingredient-filter-header" });

        const searchWrap = headerEl.createEl("div", { cls: "ingredient-filter-search" });
        this.searchInputEl = searchWrap.createEl("input", {
            type: "text",
            cls: "ingredient-filter-search-input",
            attr: { placeholder: "Filter ingredients…", spellcheck: "false" },
        });
        try {
            const searchBt = mb.parseBindTarget("filter_ingredients_search", this.path);
            const v = mb.getMetadata(searchBt);
            if (v != null && String(v).length > 0) {
                this.searchInputEl.value = String(v);
            }
        } catch {
            // optional legacy key
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

        const resetButtonConfig = {
            id: "reset-ingredient-filter",
            style: "default",
            label: "Reset",
            hidden: false,
            action: {
                type: "updateMetadata",
                bindTarget: `filter_ingredients_state`,
                value: "Object.create(null)",
                evaluate: true,
            },
        };
        const resetButton = mb.createButtonMountable(this.path, {
            declaration: resetButtonConfig,
            isPreview: false,
        });
        const resetMount = headerEl.createEl("div", { cls: "ingredient-filter-reset" });
        mb.wrapInMDRC(resetButton, resetMount, component);

        this.listEl = containerEl.createEl("div", { cls: "ingredient-filter-list" });
        await this.refreshList(mb, component);
    }

    /**
     * Rebuilds only the scrollable ingredient rows (state / amount / unit mounts).
     *
     * @param {*} mb
     * @param {import("obsidian").Component} component
     */
    async refreshList(mb, component) {
        if (!this.listEl) return;

        this.listEl.empty();
        const searchLower = String(this.searchInputEl?.value ?? "").toLowerCase();
        const visibleIngredients = this.allIngredients.filter((ing) =>
            ing.toLowerCase().includes(searchLower)
        );

        for (const ingredientName of visibleIngredients) {
            const state = this.getIngredientState(mb, ingredientName);
            this.renderIngredientRow(mb, component, this.listEl, ingredientName, state);
        }

        if (visibleIngredients.length === 0) {
            this.listEl.createEl("p", {
                text: "No ingredients match your search.",
                cls: "ingredient-filter-empty",
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
        const rowEl = listEl.createEl("div", { cls: "ingredient-filter-row" });

        const buttonId = `filter-state-${ingredientName.replace(/[^a-z0-9]/gi, "-")}`;
        const stateButtonConfig = {
            id: buttonId,
            style: "default",
            label: STATE_LABELS[state] || state,
            hidden: false,
            action: {
                type: "updateMetadata",
                bindTarget: `filter_ingredients_state["${ingredientName}"]`,
                evaluate: true,
                value: `(() => {
                    const current = x || "${FILTER_STATES.ALLOWED}";
                    const states = ${JSON.stringify(STATE_CYCLE)};
                    const idx = states.indexOf(current);
                    return states[(idx + 1) % states.length];
                })()`,
            },
        };

        const stateButton = mb.createButtonMountable(this.path, {
            declaration: stateButtonConfig,
            isPreview: false,
        });
        const stateMount = rowEl.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
        mb.wrapInMDRC(stateButton, stateMount, component);

        rowEl.createEl("span", { text: ingredientName, cls: "ingredient-filter-name" });

        if (state === FILTER_STATES.MUST_HAVE) {
            const amountConfig = new InputConfig(
                "text",
                mb.parseBindTarget(`filter_ingredients_amount["${ingredientName}"]`, this.path),
                "inline",
                [{ name: "placeholder", value: ["min amount"] }]
            ).render();
            const amountInput = mb.createInputFieldMountable(this.path, amountConfig);
            const amountMount = rowEl.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
            mb.wrapInMDRC(amountInput, amountMount, component);

            const unitArgs = [
                { name: "option", value: [""] },
                ...UNIT_OPTIONS.map((unit, index) => ({
                    name: "option",
                    value: [unit, UNIT_LABELS[index]],
                })),
            ];
            const unitConfig = new InputConfig(
                "inlineSelect",
                mb.parseBindTarget(`filter_ingredients_unit["${ingredientName}"]`, this.path),
                "inline",
                unitArgs
            ).render();
            const unitSelect = mb.createInputFieldMountable(this.path, unitConfig);
            const unitMount = rowEl.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
            mb.wrapInMDRC(unitSelect, unitMount, component);
        }
    }
}
