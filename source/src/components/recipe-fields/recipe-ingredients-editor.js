import { FRONTMATTER } from "../../shared/constants/recipe.js";
import { RECIPE_LAYOUT } from "../../shared/constants/recipe-ui.js";
import { getUILabels } from "../../shared/i18n/index.js";
import { listGroupsOrdered, normalizeIngredientGroups } from "../../shared/ingredients-utils.js";
import { addIngredientGroup, writeIngredientState } from "../../lib/recipe/ingredient-mutations.js";
import { attachIngredientListDrag } from "../../lib/recipe/ingredient-drag.js";
import { IngredientGroupPanel } from "./ingredient-group-panel.js";
import { createIngredientNote } from "../../lib/ingredient/create-ingredient-note.js";

export class RecipeIngredientsEditor {
    /**
     * @param {string} path
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     * @param {import("obsidian").App} app
     */
    constructor(path, lang, app) {
        this.path = path;
        this.lang = lang;
        this.app = app;
        this.L = getUILabels(lang);
    }

    /**
     * @param {HTMLElement} section
     * @param {*} mb
     * @param {import("obsidian").Component} component
     * @param {Record<string, unknown>} ingredients
     * @param {unknown} groups
     * @param {() => void} onRefresh
     */
    mount(section, mb, component, ingredients, groups, onRefresh) {
        section.empty();
        section.createEl("h3", { cls: RECIPE_LAYOUT.sectionHeading, text: this.L.INGREDIENTS });

        const listHost = section.createDiv({ cls: "ingredient-groups-list" });
        const ordered = listGroupsOrdered(groups);

        for (const group of ordered) {
            const panel = new IngredientGroupPanel(
                this.path,
                group,
                this.lang,
                this.app,
                onRefresh
            );
            panel.mount(listHost, mb, component, ingredients, groups, true);
        }

        const footer = section.createDiv({ cls: RECIPE_LAYOUT.ingredientGroupsFooter });
        const footerActions = footer.createDiv({ cls: RECIPE_LAYOUT.ingredientGroupsFooterActions });
        const addGroupBtn = footerActions.createEl("button", {
            type: "button",
            text: this.L.ADD_GROUP,
        });
        addGroupBtn.addEventListener("click", async () => {
            const label = await this.app.plugins.plugins["js-engine"].api.prompt.text({title:"Group", placeholder:this.L.GROUP_NAME_PLACEHOLDER});
            if (label == null || !String(label).trim()) return;
            const next = addIngredientGroup(groups, String(label).trim());
            writeIngredientState(mb, this.path, {
                groups: next,
                ingredients,
            });
            onRefresh();
        });
        const newIngredientBtn = footerActions.createEl("button", {
            type: "button",
            text: this.L.NEW_INGREDIENT,
        });
        newIngredientBtn.addEventListener("click", async () => {
            const name = await this.app.plugins.plugins["js-engine"].api.prompt.text({
                title: this.L.NEW_INGREDIENT,
                placeholder: this.L.CATALOG_SEARCH_PLACEHOLDER,
            });
            if (name == null || !String(name).trim()) return;
            await createIngredientNote(this.app, String(name).trim());
            onRefresh();
        });

        attachIngredientListDrag(listHost, mb, this.path, () => ({ groups, ingredients }), onRefresh);
    }
}
