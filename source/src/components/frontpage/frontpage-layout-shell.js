import { UI_CLASSES } from "../../shared/constants/ui.js";
import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";
import { getFrontpageLabels } from "../../shared/i18n/index.js";
import { mountCollapsibleSidebar } from "./collapsible-sections.js";

/**
 * Top-level chrome: root classes, grid shell, collapsible sidebar host.
 *
 * @param {HTMLElement} container
 * @param {import("../../shared/i18n/language.js").AppLanguage} [lang="en"]
 */
export function createFrontpageChrome(container, lang = "en") {
    container.empty();
    container.classList.add(FRONTPAGE_LAYOUT.root, UI_CLASSES.RECIPE_UI);

    const grid = container.createEl("div", { cls: FRONTPAGE_LAYOUT.grid });
    const sidebar = grid.createEl("aside", {
        cls: `${FRONTPAGE_LAYOUT.sidebar} is-collapsed`,
    });
    const main = grid.createEl("div", { cls: FRONTPAGE_LAYOUT.main });

    const L = getFrontpageLabels(lang);
    const sidebarContent = mountCollapsibleSidebar(sidebar, L.ADVANCED_SEARCH, false);

    return { grid, sidebar, main, sidebarContent };
}
