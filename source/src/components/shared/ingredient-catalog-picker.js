import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";
import { RECIPE_LAYOUT } from "../../shared/constants/recipe-ui.js";
import { getUILabels } from "../../shared/i18n/index.js";
import {
    excludeNamesFromCatalogNode,
    filterCatalogNode,
    getIngredientCatalog,
    sortedCatalogChildren,
} from "../../shared/vault/ingredient-catalog.js";
import { mountCollapsibleSection } from "../frontpage/collapsible-sections.js";

/**
 * Collapsible ingredient tree with instant search and per-leaf Add buttons.
 */
export class IngredientCatalogPicker {
    /**
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     * @param {(ingredientName: string) => void} onAdd
     */
    constructor(lang, onAdd, excludeNames = []) {
        this.lang = lang;
        this.L = getUILabels(lang);
        this.onAdd = onAdd;
        /** @type {ReadonlySet<string>} */
        this.excludeLower = new Set(
            excludeNames.map((name) => String(name).toLowerCase()).filter(Boolean)
        );
        this._searchDebounce = null;
        /** @type {HTMLInputElement | null} */
        this.searchInput = null;
        /** @type {HTMLElement | null} */
        this.treeHost = null;
    }

    /**
     * @param {HTMLElement} parent
     * @param {import("obsidian").App} app
     * @param {boolean} [startOpen=false]
     */
    mount(parent, app, startOpen = false) {
        const section = parent.createDiv({ cls: RECIPE_LAYOUT.catalogPicker });
        const header = section.createDiv({ cls: RECIPE_LAYOUT.catalogPickerHeader });
        const toggle = header.createEl("button", {
            type: "button",
            cls: `${RECIPE_LAYOUT.catalogPickerToggle} ${FRONTPAGE_LAYOUT.sectionToggle}`,
            text: this.L.CATALOG_PICKER_TITLE,
        });
        const body = section.createDiv({
            cls: `${RECIPE_LAYOUT.catalogPickerBody}${startOpen ? "" : " is-collapsed"}`,
        });

        const searchWrap = body.createDiv({ cls: RECIPE_LAYOUT.catalogPickerSearch });
        this.searchInput = searchWrap.createEl("input", {
            type: "text",
            cls: RECIPE_LAYOUT.catalogPickerSearchInput,
            attr: {
                placeholder: this.L.CATALOG_SEARCH_PLACEHOLDER,
                spellcheck: "false",
            },
        });

        this.treeHost = body.createDiv({ cls: RECIPE_LAYOUT.catalogPickerTree });

        toggle.addEventListener("click", () => {
            body.classList.toggle("is-collapsed");
        });

        const renderTree = () => {
            if (!this.treeHost) return;
            this.treeHost.empty();
            const needle = this.searchInput?.value ?? "";
            const catalog = getIngredientCatalog(app);
            const availableRoot = excludeNamesFromCatalogNode(catalog.root, this.excludeLower);
            const filteredRoot = filterCatalogNode(availableRoot, needle);

            this.#mountCatalogNode(this.treeHost, filteredRoot, false);

            const uncAvailable = catalog.uncategorized.filter(
                (n) => !this.excludeLower.has(n.toLowerCase())
            );
            if (uncAvailable.length > 0) {
                const uncFiltered = needle
                    ? uncAvailable.filter((n) =>
                          n.toLowerCase().includes(needle.toLowerCase())
                      )
                    : uncAvailable;
                if (uncFiltered.length > 0) {
                    const content = mountCollapsibleSection(
                        this.treeHost,
                        this.L.CATALOG_UNCATEGORIZED,
                        false,
                        RECIPE_LAYOUT.catalogPickerNested
                    );
                    for (const name of uncFiltered) {
                        this.#mountLeafRow(content, name);
                    }
                }
            }
        };

        this.searchInput.addEventListener("input", () => {
            window.clearTimeout(this._searchDebounce);
            this._searchDebounce = window.setTimeout(renderTree, 80);
        });

        renderTree();
    }

    /**
     * @param {HTMLElement} parent
     * @param {import("../../shared/vault/ingredient-catalog.js").CatalogNode} node
     * @param {boolean} nested
     */
    #mountCatalogNode(parent, node, nested) {
        for (const child of sortedCatalogChildren(node)) {
            const hasGrandchildren =
                child.children.size > 0 || child.ingredients.length > 0;
            if (!hasGrandchildren) continue;

            const host = nested
                ? parent.createDiv({ cls: RECIPE_LAYOUT.catalogPickerNested })
                : parent;

            const content = mountCollapsibleSection(
                host,
                child.label,
                false,
                RECIPE_LAYOUT.catalogPickerNested
            );

            for (const name of child.ingredients) {
                this.#mountLeafRow(content, name);
            }
            this.#mountCatalogNode(content, child, true);
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
}
