import {
    ingredientsContentSignature,
    ingredientEntry,
    listReadableIngredientIds,
    listGroupsOrdered,
    listRowIdsForGroup,
    listIngredientIds,
} from "../../shared/ingredients-utils.js";
import { RECIPE_LAYOUT } from "../../shared/constants/recipe-ui.js";
import { ViewConfig } from "../config/view-config.js";
import { wrapMdrcInDedicatedMount } from "../../lib/render/mdrc-layout.js";

class IngredientViewRow {
    constructor(path, id, name, amount = 0, unit = "") {
        this.path = path;
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.unit = unit;
        const ing = `ingredients["${this.id}"]`;
        this.viewConfigs = {
            amount: new ViewConfig(
                `VIEW[convertBackDisplay({${ing}.unit}, {${ing}.amount}, {${ing}.name}, {memory^person["current"]}/max(1, {person.raw}))]`
            ).render(),
            unit: new ViewConfig(`VIEW[{${ing}.unit}]`).render(),
            name: new ViewConfig(`VIEW[{${ing}.name}]`).render(),
        };
        this.isGenerated = false;
        this.fields = [];
    }

    generate(mb) {
        this.isGenerated = true;
        const nameField = mb.createViewFieldMountable(this.path, this.viewConfigs.name);
        const amountField = mb.createViewFieldMountable(this.path, this.viewConfigs.amount);
        const unitField = mb.createViewFieldMountable(this.path, this.viewConfigs.unit);

        if (!this.amount) {
            this.fields = [nameField];
        } else if (this.unit === "") {
            this.fields = [amountField, unitField, nameField];
        } else {
            this.fields = [amountField, nameField];
        }
    }

    render(mb) {
        if (!this.isGenerated) this.generate(mb);
        return this.fields;
    }
}

export class IngredientViewTable {
    constructor(path) {
        this.path = path;
        this.isGenerated = false;
        this.ingredientsSnapshot = "";
        this.groupsSnapshot = "";
        this.readableOnly = false;
    }

    #rowIdsForGroup(ingredients, groupId, readableOnly) {
        const ids = listRowIdsForGroup(ingredients, groupId);
        if (!readableOnly) return ids;
        const readable = new Set(listReadableIngredientIds(ingredients));
        return ids.filter((id) => readable.has(id));
    }

    discardMountables() {
        this.isGenerated = false;
        this.ingredientsSnapshot = "";
        this.groupsSignature = "";
        this.readableOnly = false;
    }

    /**
     * @param {*} mb
     * @param {import("obsidian").Component} component
     * @param {HTMLElement} section
     * @param {Record<string, unknown>} ingredients
     * @param {unknown} groups
     * @param {boolean} [readableOnly=false]
     */
    renderGrouped(mb, component, section, ingredients, groups, readableOnly = false) {
        const ingSig = ingredientsContentSignature(ingredients, groups);
        if (this.isGenerated && this.ingredientsSnapshot === ingSig && this.readableOnly === readableOnly) {
            return;
        }
        this.ingredientsSnapshot = ingSig;
        this.readableOnly = readableOnly;
        this.isGenerated = true;

        const ordered = listGroupsOrdered(groups);
        let any = false;

        for (const group of ordered) {
            const ids = this.#rowIdsForGroup(ingredients, group.id, readableOnly);
            if (ids.length === 0) continue;
            any = true;

            const groupEl = section.createDiv({ cls: RECIPE_LAYOUT.ingredientGroupRead });
            groupEl.createEl("h4", { cls: RECIPE_LAYOUT.sectionHeading, text: group.label });

            for (const id of ids) {
                const rowData = ingredientEntry(ingredients, id);
                const row = new IngredientViewRow(
                    this.path,
                    id,
                    rowData.name,
                    rowData.amount,
                    rowData.unit
                );
                const rowEl = groupEl.createDiv({ cls: RECIPE_LAYOUT.ingredientRow });
                row.render(mb).forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, rowEl));
            }
        }

        if (!any && !readableOnly) {
            for (const id of listIngredientIds(ingredients)) {
                const rowData = ingredientEntry(ingredients, id);
                const row = new IngredientViewRow(this.path, id, rowData.name, rowData.amount, rowData.unit);
                const rowEl = section.createDiv({ cls: RECIPE_LAYOUT.ingredientRow });
                row.render(mb).forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, rowEl));
            }
        }
    }
}
