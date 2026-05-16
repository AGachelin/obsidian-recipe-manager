import { UI_CLASSES } from "../../shared/constants/ui.js";
import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";
import { mountCollapsibleSidebar } from "../../lib/frontpage/collapsible-sections.js";

/**
 * Top-level chrome: root classes, grid shell, collapsible sidebar host.
 *
 * @param {HTMLElement} container
 */
export function createFrontpageChrome(container) {
    container.empty();
    container.classList.add(FRONTPAGE_LAYOUT.root, UI_CLASSES.RECIPE_UI);

    const grid = container.createEl("div", { cls: FRONTPAGE_LAYOUT.grid });
    const sidebar = grid.createEl("aside", {
        cls: `${FRONTPAGE_LAYOUT.sidebar} is-collapsed`,
    });
    const main = grid.createEl("div", { cls: FRONTPAGE_LAYOUT.main });

    const sidebarContent = mountCollapsibleSidebar(sidebar, "Advanced search", false);

    return { grid, sidebar, main, sidebarContent };
}
