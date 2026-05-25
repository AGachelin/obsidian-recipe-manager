import { RECIPE_LAYOUT } from "../../shared/constants/recipe-ui.js";
import { getUILabels } from "../../shared/i18n/index.js";
import {
    countCatalogLeaves,
    excludeNamesFromCatalogNode,
    filterCatalogNode,
    getIngredientCatalog,
    refreshIngredientCatalog,
    sortedCatalogChildren,
} from "../../shared/vault/ingredient-catalog.js";
import { mountCollapsibleSection } from "../frontpage/collapsible-sections.js";
import { createIngredientNote } from "../../lib/ingredient/create-ingredient-note.js";

const INGREDIENTS_PREFIX = "Ingredients/";

/**
 * Collapsible ingredient tree with instant search and per-leaf Add buttons.
 */
export class IngredientCatalogPicker {
    /**
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     * @param {(ingredientName: string) => void} onAdd
     * @param {string[]} [excludeNames]
     * @param {{ onAfterCreate?: (name: string) => void }} [options]
     */
    constructor(lang, onAdd, excludeNames = [], options = {}) {
        this.lang = lang;
        this.L = getUILabels(lang);
        this.onAdd = onAdd;
        this.onAfterCreate = options.onAfterCreate;
        /** @type {ReadonlySet<string>} */
        this.excludeLower = new Set(
            excludeNames.map((name) => String(name).toLowerCase()).filter(Boolean)
        );
        this._searchDebounce = null;
        /** @type {HTMLInputElement | null} */
        this.searchInput = null;
        /** @type {HTMLElement | null} */
        this.treeHost = null;
        /** @type {import("obsidian").App | null} */
        this._app = null;
        /** @type {import("obsidian").Component | null} */
        this._component = null;
    }

    /**
     * @param {HTMLElement} parent
     * @param {import("obsidian").App} app
     * @param {import("obsidian").Component} [component]
     * @param {boolean} [startOpen=false]
     */
    mount(parent, app, component = null, startOpen = false) {
        this._app = app;
        this._component = component;

        const pickerRoot = parent.createDiv({ cls: RECIPE_LAYOUT.catalogPicker });
        const treeSection = mountCollapsibleSection(
            pickerRoot,
            this.L.CATALOG_PICKER_TITLE,
            startOpen,
            RECIPE_LAYOUT.catalogPickerBody,
            { variant: "recipe" }
        );

        const searchWrap = treeSection.createDiv({ cls: RECIPE_LAYOUT.catalogPickerSearch });
        this.searchInput = searchWrap.createEl("input", {
            type: "text",
            cls: RECIPE_LAYOUT.catalogPickerSearchInput,
            attr: {
                placeholder: this.L.CATALOG_SEARCH_PLACEHOLDER,
                spellcheck: "false",
            },
        });

        this.treeHost = treeSection.createDiv({ cls: RECIPE_LAYOUT.catalogPickerTree });

        const renderTree = () => {
            if (!this.treeHost || !this._app) return;
            this.treeHost.empty();
            const needle = this.searchInput?.value ?? "";
            const catalog = getIngredientCatalog(this._app);
            const availableRoot = excludeNamesFromCatalogNode(catalog.root, this.excludeLower);
            const filteredRoot = filterCatalogNode(availableRoot, needle);

            let leafCount = countCatalogLeaves(filteredRoot);

            this.#mountCatalogNode(this.treeHost, filteredRoot);

            const uncAvailable = catalog.uncategorized.filter(
                (n) => !this.excludeLower.has(n.toLowerCase())
            );
            const uncFiltered = needle
                ? uncAvailable.filter((n) => n.toLowerCase().includes(needle.toLowerCase()))
                : uncAvailable;

            if (uncFiltered.length > 0) {
                const content = mountCollapsibleSection(
                    this.treeHost,
                    this.L.CATALOG_UNCATEGORIZED,
                    false,
                    RECIPE_LAYOUT.catalogPickerNested,
                    { variant: "compact" }
                );
                for (const name of uncFiltered) {
                    this.#mountLeafRow(content, name);
                }
                leafCount += uncFiltered.length;
            }

            const trimmedNeedle = needle.trim();
            if (leafCount === 0 && trimmedNeedle) {
                this.#mountNoMatchState(this.treeHost, trimmedNeedle);
            }
        };

        this.searchInput.addEventListener("input", () => {
            window.clearTimeout(this._searchDebounce);
            this._searchDebounce = window.setTimeout(renderTree, 80);
        });

        if (component) {
            const scheduleRefresh = () => {
                refreshIngredientCatalog(app);
                renderTree();
            };
            const onVault = (file) => {
                if (file?.path?.startsWith(INGREDIENTS_PREFIX)) {
                    scheduleRefresh();
                }
            };
            component.registerEvent(app.vault.on("create", onVault));
            component.registerEvent(app.vault.on("delete", onVault));
            component.registerEvent(app.vault.on("rename", onVault));
            component.registerEvent(
                app.metadataCache.on("changed", (file) => {
                    if (file.path.startsWith(INGREDIENTS_PREFIX)) {
                        window.setTimeout(scheduleRefresh, 200);
                    }
                })
            );
        }

        renderTree();
    }

    /**
     * @param {HTMLElement} parent
     * @param {import("../../shared/vault/ingredient-catalog.js").CatalogNode} node
     */
    #mountCatalogNode(parent, node) {
        for (const child of sortedCatalogChildren(node)) {
            if (child.children.size === 0 && child.ingredients.length === 0) continue;

            const content = mountCollapsibleSection(
                parent,
                child.label,
                false,
                RECIPE_LAYOUT.catalogPickerNested,
                { variant: "compact" }
            );

            for (const name of child.ingredients) {
                this.#mountLeafRow(content, name);
            }
            this.#mountCatalogNode(content, child);
        }
    }

    /**
     * @param {HTMLElement} parent
     * @param {string} name
     */
    #mountLeafRow(parent, name) {
        const row = parent.createDiv({ cls: RECIPE_LAYOUT.catalogPickerLeaf });
        row.createEl("span", { text: name });
        const btn = row.createEl("button", {
            type: "button",
            cls: RECIPE_LAYOUT.catalogPickerAddBtn,
            text: this.L.CATALOG_ADD,
        });
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            this.onAdd(name);
        });
    }

    /**
     * @param {HTMLElement} parent
     * @param {string} suggestedName
     */
    #mountNoMatchState(parent, suggestedName) {
        const block = parent.createDiv({ cls: RECIPE_LAYOUT.catalogPickerEmpty });
        block.createEl("p", {
            cls: RECIPE_LAYOUT.catalogPickerEmptyText,
            text: this.L.CATALOG_NO_MATCH,
        });
        const btn = block.createEl("button", {
            type: "button",
            cls: RECIPE_LAYOUT.catalogPickerCreateBtn,
            text: this.L.CREATE_INGREDIENT,
        });
        btn.addEventListener("click", async (e) => {
            e.preventDefault();
            const name = await this._app.plugins.plugins["js-engine"].api.prompt.text({
                title: this.L.NEW_INGREDIENT,
                placeholder: this.L.CATALOG_SEARCH_PLACEHOLDER,
                initialValue: suggestedName,
            });
            if (name == null || !String(name).trim()) return;
            if (!this._app) return;
            const result = await createIngredientNote(this._app, name);
            if (!result.ok) return;
            this.onAdd(result.basename);
            this.onAfterCreate?.(result.basename);
            refreshIngredientCatalog(this._app);
            if (this.searchInput) {
                this.searchInput.value = "";
            }
            this.searchInput?.dispatchEvent(new Event("input"));
        });
    }
}
