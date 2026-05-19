import { ButtonConfig } from "../config/button-config.js";
import { UI_CLASSES } from "../../shared/constants/ui.js";
import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";
import { getFrontpageLabels } from "../../shared/i18n/index.js";

/** Title, “new recipe”, index heading, name filter toolbar, empty table host shell. */
export class FrontpageRecipeIndexChrome {
    /**
     * @param {string} path
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     */
    constructor(path, lang) {
        this.path = path;
        this.lang = lang;
        this.L = getFrontpageLabels(lang);
    }

    /** @returns {{ recipeNameInput: HTMLInputElement, countEl: HTMLElement, tableHost: HTMLElement }} */
    mount(mainEl, mb, component) {
        mainEl.createEl("h1", { cls: FRONTPAGE_LAYOUT.pageTitle, text: this.L.PAGE_TITLE });

        const actions = mainEl.createEl("div", { cls: FRONTPAGE_LAYOUT.actions });
        const newRecipeCfg = new ButtonConfig("new-recipe", this.L.NEW_RECIPE, null, "primary");
        newRecipeCfg.addAction({
            type: "runTemplaterFile",
            templateFile: "source/templates/recipe.md",
        });
        const newRecipeBtn = mb.createButtonMountable(this.path, newRecipeCfg.render(false));
        const newRecipeMount = actions.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
        mb.wrapInMDRC(newRecipeBtn, newRecipeMount, component);

        mainEl.createEl("h2", { cls: FRONTPAGE_LAYOUT.indexHeading, text: this.L.INDEX_HEADING });

        const toolbar = mainEl.createDiv({ cls: FRONTPAGE_LAYOUT.toolbar });
        toolbar.createEl("label", {
            cls: FRONTPAGE_LAYOUT.toolbarLabel,
            attr: { for: "frontpage-recipe-name-filter" },
            text: this.L.RECIPE_NAME_LABEL,
        });
        const recipeNameInput = toolbar.createEl("input", {
            type: "text",
            cls: FRONTPAGE_LAYOUT.recipeNameInput,
            attr: {
                id: "frontpage-recipe-name-filter",
                placeholder: this.L.RECIPE_NAME_PLACEHOLDER,
                spellcheck: "false",
                "aria-label": this.L.RECIPE_NAME_ARIA,
            },
        });

        const countEl = toolbar.createEl("span", { cls: FRONTPAGE_LAYOUT.count });
        const tableHost = mainEl.createDiv({ cls: FRONTPAGE_LAYOUT.tableHost });

        return { recipeNameInput, countEl, tableHost };
    }
}
