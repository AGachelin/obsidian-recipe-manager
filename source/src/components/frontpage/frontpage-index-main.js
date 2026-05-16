import { ButtonConfig } from "../config/button-config.js";
import { UI_CLASSES } from "../../shared/constants/ui.js";
import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";

/** Title, “new recipe”, index heading, name filter toolbar, empty table host shell. */
export class FrontpageRecipeIndexChrome {
    /** @param {string} path */
    constructor(path) {
        this.path = path;
    }

    /** @returns {{ recipeNameInput: HTMLInputElement, countEl: HTMLElement, tableHost: HTMLElement }} */
    mount(mainEl, mb, component) {
        mainEl.createEl("h1", { cls: FRONTPAGE_LAYOUT.pageTitle, text: "Recipes" });

        const actions = mainEl.createEl("div", { cls: FRONTPAGE_LAYOUT.actions });
        const newRecipeCfg = new ButtonConfig("new-recipe", "New recipe", null, "primary");
        newRecipeCfg.addAction({
            type: "runTemplaterFile",
            templateFile: "source/templates/recipe.md",
        });
        const newRecipeBtn = mb.createButtonMountable(this.path, newRecipeCfg.render(false));
        const newRecipeMount = actions.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
        mb.wrapInMDRC(newRecipeBtn, newRecipeMount, component);

        mainEl.createEl("h2", { cls: FRONTPAGE_LAYOUT.indexHeading, text: "Recipe index" });

        const toolbar = mainEl.createEl("div", { cls: FRONTPAGE_LAYOUT.toolbar });
        toolbar.createEl("label", {
            cls: FRONTPAGE_LAYOUT.toolbarLabel,
            attr: { for: "frontpage-recipe-name-filter" },
            text: "Recipe name",
        });
        const recipeNameInput = toolbar.createEl("input", {
            type: "text",
            cls: FRONTPAGE_LAYOUT.recipeNameInput,
            attr: {
                id: "frontpage-recipe-name-filter",
                placeholder: "Filter by recipe name…",
                spellcheck: "false",
                "aria-label": "Filter recipes by name",
            },
        });

        const countEl = toolbar.createEl("span", { cls: FRONTPAGE_LAYOUT.count });
        const tableHost = mainEl.createEl("div", { cls: FRONTPAGE_LAYOUT.tableHost });

        return { recipeNameInput, countEl, tableHost };
    }
}
