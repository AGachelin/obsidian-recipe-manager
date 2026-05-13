import { ingredientsContentSignature, listIngredientIds } from "../../shared/ingredients-utils.js";
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
        this.viewDeclaration = {
            amount: `VIEW[convertBackDisplay({${ing}.unit}, {${ing}.amount}, {${ing}.name}, {person.current}/{person.raw})]`,
            unit: `VIEW[{${ing}.unit}]`,
            name: `VIEW[{${ing}.name}]`,
        };
        this.viewConfigs = {
            amount: new ViewConfig("text", null).render(this.viewDeclaration.amount),
            unit: new ViewConfig("text", null).render(this.viewDeclaration.unit),
            name: new ViewConfig("text", null).render(this.viewDeclaration.name),
        };
        this.isGenerated = false;
        /** @type {unknown[]} */
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
        /** @type {unknown[][]} */
        this.fields = [];
        /** @type {string} */
        this.ingredientsSnapshot = "";
    }

    generate(mb, ingredients) {
        this.mb = mb;
        this.ingredientsSnapshot = ingredientsContentSignature(ingredients);
        this.fields = [];
        for (const id of listIngredientIds(ingredients)) {
            const ingredient = ingredients[id] || {};
            const row = new IngredientViewRow(
                this.path,
                id,
                ingredient.name || "ingredient",
                ingredient.amount ?? 0,
                ingredient.unit ?? ""
            );
            this.fields.push(row.render(mb));
        }
        this.isGenerated = true;
    }

    discardMountables() {
        this.isGenerated = false;
        this.fields = [];
        this.ingredientsSnapshot = "";
    }

    render(mb, ingredients) {
        const nextSnapshot = ingredientsContentSignature(ingredients);
        if (!this.isGenerated || this.ingredientsSnapshot !== nextSnapshot) {
            this.generate(mb, ingredients);
        }
        return this.fields;
    }
}
