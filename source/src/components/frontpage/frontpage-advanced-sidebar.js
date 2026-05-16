import { IngredientFilter } from "./ingredient-filter.js";
import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";
import { mountCollapsibleSection } from "../../lib/frontpage/collapsible-sections.js";
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
    /** @param {string} path */
    constructor(path) {
        this.path = path;
        this.rating = new FrontpageRatingFilterSection(path);
        this.durations = new FrontpageDurationFilterSection(path);
        this.tags = new FrontpageTagsFilterSection(path);
        this.source = new FrontpageSourceFilterSection(path);
        this.ingredientFilter = new IngredientFilter(path);
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
            "Ingredients",
            false,
            FRONTPAGE_LAYOUT.ingredientSection
        );

        await this.ingredientFilter.mount(mb, component, secIngredients, ingredientOptions);

        const btnRow = sidebarContent.createEl("div", { cls: FRONTPAGE_LAYOUT.sidebarActions });
        const btnApply = btnRow.createEl("button", {
            cls: FRONTPAGE_LAYOUT.btnApply,
            text: "Apply advanced filters",
            type: "button",
        });
        const btnReset = btnRow.createEl("button", {
            cls: FRONTPAGE_LAYOUT.btnReset,
            text: "Reset all advanced filters",
            type: "button",
        });

        return { btnApply, btnReset };
    }
}
