import { RECIPE_LAYOUT } from "../../shared/constants/recipe-ui.js";
import { getUILabels } from "../../shared/i18n/index.js";
import {
    ingredientEntry,
    listIngredientNamesForGroup,
    listRowIdsForGroup,
} from "../../shared/ingredients-utils.js";
import { IngredientCatalogPicker } from "../shared/ingredient-catalog-picker.js";
import { IngredientInputRow } from "./ingredient-input-row.js";
import { applyMdrcLayoutSteps } from "../../lib/render/mdrc-layout.js";
import {
    deleteIngredientGroup,
    persistAddIngredientRow,
    renameIngredientGroup,
    writeIngredientState,
} from "../../lib/recipe/ingredient-mutations.js";

export class IngredientGroupPanel {
    /**
     * @param {string} path
     * @param {{ id: string, label: string, order: number }} group
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     * @param {import("obsidian").App} app
     * @param {() => void} onStructureChange
     */
    constructor(path, group, lang, app, onStructureChange) {
        this.path = path;
        this.group = group;
        this.lang = lang;
        this.app = app;
        this.onStructureChange = onStructureChange;
        this.L = getUILabels(lang);
    }

    /**
     * @param {HTMLElement} parent
     * @param {*} mb
     * @param {import("obsidian").Component} component
     * @param {Record<string, unknown>} ingredients
     * @param {unknown} groups
     * @param {boolean} [enableDrag=false]
     */
    mount(parent, mb, component, ingredients, groups, enableDrag = false) {
        const panel = parent.createDiv({
            cls: RECIPE_LAYOUT.ingredientGroupPanel,
            attr: { "data-group-panel": this.group.id },
        });
        if (enableDrag) {
            panel.setAttr("draggable", "true");
        }

        const header = panel.createDiv({ cls: RECIPE_LAYOUT.ingredientGroupHeader });
        if (enableDrag) {
            header.createEl("span", { cls: RECIPE_LAYOUT.dragHandle, text: "⋮⋮" });
        }

        const titleInput = header.createEl("input", {
            type: "text",
            cls: RECIPE_LAYOUT.ingredientGroupTitle,
            value: this.group.label,
        });
        titleInput.addEventListener("change", () => {
            const next = renameIngredientGroup(groups, this.group.id, titleInput.value);
            writeIngredientState(mb, this.path, { groups: next, ingredients });
            this.onStructureChange();
        });

        const actions = header.createDiv({ cls: RECIPE_LAYOUT.ingredientGroupActions });
        const deleteBtn = actions.createEl("button", {
            type: "button",
            text: this.L.DELETE_GROUP,
        });
        deleteBtn.addEventListener("click", () => {
            const result = deleteIngredientGroup(ingredients, groups, this.group.id);
            writeIngredientState(mb, this.path, result);
            this.onStructureChange();
        });

        const usedInGroup = listIngredientNamesForGroup(ingredients, this.group.id);
        const picker = new IngredientCatalogPicker(
            this.lang,
            (name) => {
                persistAddIngredientRow(mb, this.path, this.group.id, name, groups, ingredients);
                this.onStructureChange();
            },
            usedInGroup
        );
        picker.mount(panel, this.app, false);

        const rowsHost = panel.createDiv({ cls: RECIPE_LAYOUT.ingredientGroupRows });
        for (const rowId of listRowIdsForGroup(ingredients, this.group.id)) {
            const data = ingredientEntry(ingredients, rowId);
            const row = new IngredientInputRow(this.path, rowId, data.name, this.lang);
            row.render(mb, data.amount, data.unit);
            const rowEl = rowsHost.createDiv({
                cls: RECIPE_LAYOUT.ingredientRow,
                attr: { "data-ingredient-row-id": rowId },
            });
            applyMdrcLayoutSteps(mb, component, row.layoutSteps(rowEl, { draggable: enableDrag }));
        }
    }
}
