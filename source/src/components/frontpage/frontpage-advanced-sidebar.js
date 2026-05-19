import { IngredientFilter } from "./ingredient-filter.js";
import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";
import { getFrontpageLabels } from "../../shared/i18n/index.js";
import { mountCollapsibleSection } from "./collapsible-sections.js";
import {
    FrontpageRatingFilterSection,
    FrontpageDurationFilterSection,
    FrontpageTagsFilterSection,
    FrontpageSourceFilterSection,
} from "./frontpage-filter-sections.js";

/**
 * Sidebar “advanced search”: composes filter widgets + footer actions (apply / reset).
 */
export class FrontpageAdvancedSidebar {
    /**
     * @param {string} path
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     */
    constructor(path, lang) {
        this.path = path;
        this.lang = lang;
        this.L = getFrontpageLabels(lang);
        this.rating = new FrontpageRatingFilterSection(path, lang);
        this.durations = new FrontpageDurationFilterSection(path, lang);
        this.tags = new FrontpageTagsFilterSection(path, lang);
        this.source = new FrontpageSourceFilterSection(path, lang);
        this.ingredientFilter = new IngredientFilter(path, lang);
    }

    /** @param {*} mb */
    generate(mb) {
        this.durations.generate(mb);
        this.tags.generate(mb);
    }

    /**
     * @param {HTMLElement} sidebarContent
     * @param {*} mb
     * @param {import("obsidian").Component} component
     * @param {{ onSearchChange?: () => void }} [ingredientOptions]
     * @returns {Promise<{ btnApply: HTMLButtonElement, btnReset: HTMLButtonElement }>}
     */
    async mount(sidebarContent, mb, component, ingredientOptions = {}) {
        this.rating.mount(sidebarContent, mb, component);
        this.durations.mount(sidebarContent, mb, component);
        this.tags.mount(sidebarContent, mb, component);
        this.source.mount(sidebarContent, mb, component);

        const secIngredients = mountCollapsibleSection(
            sidebarContent,
            this.L.INGREDIENTS_SECTION,
            false,
            FRONTPAGE_LAYOUT.ingredientSection
        );

        await this.ingredientFilter.mount(mb, component, secIngredients, ingredientOptions);

        const btnRow = sidebarContent.createDiv({ cls: FRONTPAGE_LAYOUT.sidebarActions });
        const btnApply = btnRow.createEl("button", {
            cls: FRONTPAGE_LAYOUT.btnApply,
            text: this.L.APPLY_FILTERS,
            type: "button",
        });
        const btnReset = btnRow.createEl("button", {
            cls: FRONTPAGE_LAYOUT.btnReset,
            text: this.L.RESET_FILTERS,
            type: "button",
        });

        return { btnApply, btnReset };
    }
}
