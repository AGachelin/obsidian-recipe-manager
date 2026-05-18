import {
    ingredientsContentSignature,
    ingredientEntry,
    listReadableIngredientIds,
} from "../../shared/ingredients-utils.js";
import { ViewConfig } from "../config/view-config.js";

class IngredientViewRow {
    /**
     * @param {string} path
     * @param {string} id
     * @param {string} name
     * @param {number} [amount]
     * @param {string} [unit]
     */
    constructor(path, id, name, amount = 0, unit = "") {
        this.path = path;
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.unit = unit;
        const ing = `ingredients["${this.id}"]`;
        this.viewConfigs = {
            amount: new ViewConfig(`VIEW[convertBackDisplay({${ing}.unit}, {${ing}.amount}, {${ing}.name}, {memory^person["current"]}/max(1, {person.raw}))]`).render(),
            unit: new ViewConfig(`VIEW[{${ing}.unit}]`).render(),
            name: new ViewConfig(`VIEW[{${ing}.name}]`).render(),
        };
        this.isGenerated = false;
        this.fields = [];
    }

    generate(mb) {
        this.isGenerated = true;
        this.mb = mb;

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
        if (!this.isGenerated) {
            this.generate(mb);
        }
        return this.fields;
    }
}

export class IngredientViewTable {
    constructor(path) {
        this.path = path;
        this.isGenerated = false;
        this.fields = [];
        this.ingredientsSnapshot = "";
        this.readableOnly = false;
    }

    generate(mb, ingredients, readableOnly = false) {
        this.mb = mb;
        this.readableOnly = readableOnly;
        this.ingredientsSnapshot = ingredientsContentSignature(ingredients);
        this.fields = [];
        const ids = readableOnly ? listReadableIngredientIds(ingredients) : listIngredientIds(ingredients);
        for (const id of ids) {
            const rowData = ingredientEntry(ingredients, id);
            const row = new IngredientViewRow(
                this.path,
                id,
                rowData.name,
                rowData.amount,
                rowData.unit
            );
            this.fields.push(row.render(mb));
        }
        this.isGenerated = true;
    }

    discardMountables() {
        this.isGenerated = false;
        this.fields = [];
        this.ingredientsSnapshot = "";
        this.readableOnly = false;
    }

    render(mb, ingredients, readableOnly = false) {
        const nextSnapshot = ingredientsContentSignature(ingredients);
        if (
            !this.isGenerated ||
            this.ingredientsSnapshot !== nextSnapshot ||
            this.readableOnly !== readableOnly
        ) {
            this.generate(mb, ingredients, readableOnly);
        }
        return this.fields;
    }
}
