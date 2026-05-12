import { UNIT_OPTIONS, UNIT_LABELS } from "../../shared/constants/custom_units.js";
import { FRONTMATTER } from "../../shared/constants/recipe.js";
import { ingredientsContentSignature, listIngredientIds } from "../../shared/ingredients-utils.js";
import { UI_CLASSES, UI_LABELS } from "../../shared/constants/ui.js";
import { InputConfig } from "../config/input-config.js";
import { ViewConfig } from "../config/view-config.js";

const FM = FRONTMATTER;
const ING = "ingredients";

class IngredientInputRow {
    constructor(path, id, name) {
        this.path = path;
        this.id = id;
        this.name = name;
        this.unitOptionArguments = [
            { name: "option", value: [""] },
            ...UNIT_OPTIONS.map((unit, index) => ({
                name: "option",
                value: [unit, UNIT_LABELS[index]],
            })),
        ];
        this.isGenerated = false;
    }

    generate(mb, amount = 0, unit = "") {
        this.isGenerated = true;
        this.mb = mb;
        this.amount = amount;
        this.unit = unit;

        const btAvailable = FM.AVAILABLE_INGREDIENTS;
        const btIngredients = FM.INGREDIENTS;

        this.bindTargetAmountMemory = mb.createBindTarget("memory", this.path, [ING, `${this.id}`, "amount"], true);
        this.bindTargetAmountFrontmatter = mb.createBindTarget("frontmatter", this.path, [ING, `${this.id}`, "amount"], true);
        this.bindTargetUnit = mb.createBindTarget("frontmatter", this.path, [ING, `${this.id}`, "unit"], true);
        this.bindTargetUnitMemory = mb.createBindTarget("memory", this.path, [ING, `${this.id}`, "unit"], true);
        this.bindTargetNameMemory = mb.createBindTarget("memory", this.path, [ING, `${this.id}`, "name"], true);

        mb.setMetadata(this.bindTargetAmountMemory, Number(amount));
        mb.setMetadata(this.bindTargetUnitMemory, unit);
        mb.setMetadata(this.bindTargetNameMemory, this.name);

        this.deleteButtonConfig = {
            id: `delete-${this.id}`,
            style: "default",
            label: UI_LABELS.DELETE,
            hidden: false,
            actions: [
                {
                    type: "updateMetadata",
                    bindTarget: btAvailable,
                    evaluate: true,
                    value: `x==null?["${this.name}"]:["${this.name}",...x]`,
                },
                {
                    type: "updateMetadata",
                    bindTarget: btIngredients,
                    evaluate: true,
                    value: `(delete x["${this.id}"])?x:x`,
                },
            ],
        };

        this.changeButtonConfig = {
            id: `ingredient-${this.id}`,
            style: "default",
            label: `${this.name}`,
            hidden: false,
            action: {
                type: "js",
                file: "source/src/components/ingredients-input.js",
                args: { id: this.id },
            },
        };

        this.deleteButtonOptions = { declaration: this.deleteButtonConfig, isPreview: false };
        this.changeButtonOptions = { declaration: this.changeButtonConfig, isPreview: false };

        this.deleteButton = mb.createButtonMountable(this.path, this.deleteButtonOptions);
        this.changeButton = mb.createButtonMountable(this.path, this.changeButtonOptions);
        this.amountInput = mb.createInputFieldMountable(this.path, this.createAmountInputConfig(amount));
        this.amountHiddenView = mb.createViewFieldMountable(this.path, this.createConvertViewConfig());
        this.unitSyncView = mb.createViewFieldMountable(this.path, this.createUnitSyncViewConfig());
        this.unitSelect = mb.createInputFieldMountable(this.path, this.createUnitSelectConfig(unit));
    }

    createAmountInputConfig(amount = 0) {
        return new InputConfig("number", this.bindTargetAmountMemory, "inline", [
            { name: "defaultValue", value: [`${amount}`] },
        ]).render();
    }

    createUnitSelectConfig(unit = "") {
        return new InputConfig("inlineSelect", this.bindTargetUnitMemory, "inline", [
            ...this.unitOptionArguments,
            { name: "defaultValue", value: [`${unit}`] },
        ]).render();
    }

    createConvertViewConfig() {
        const declaration = `VIEW[bind(convert({memory^ingredients["${this.id}"]["unit"]}, {memory^ingredients["${this.id}"]["amount"]}, {memory^ingredients["${this.id}"]["name"]}), 0, null)][math(hidden):ingredients["${this.id}"]["amount"]]`;
        return new ViewConfig("math", this.bindTargetAmountFrontmatter).render(declaration);
    }

    createUnitSyncViewConfig() {
        const declaration = `VIEW[{memory^ingredients["${this.id}"]["unit"]}][text(hidden):ingredients["${this.id}"]["unit"]]`;
        return new ViewConfig("text", this.bindTargetUnit).render(declaration);
    }

    render(mb, amount = 0, unit = "") {
        if (!this.isGenerated || this.amount !== amount || this.unit !== unit) {
            this.generate(mb, amount, unit);
        }
    }

    /**
     * @param {HTMLElement} rowEl
     * @returns {Array<{ parent: HTMLElement, field: unknown, wrapperCls?: string }>}
     */
    layoutSteps(rowEl) {
        return [
            { parent: rowEl, field: this.changeButton },
            { parent: rowEl, field: this.amountInput },
            {
                parent: rowEl,
                wrapperCls: UI_CLASSES.HIDDEN_VIEW_FIELD,
                field: this.amountHiddenView,
            },
            { parent: rowEl, field: this.unitSelect },
            {
                parent: rowEl,
                wrapperCls: UI_CLASSES.HIDDEN_VIEW_FIELD,
                field: this.unitSyncView,
            },
            { parent: rowEl, field: this.deleteButton },
        ];
    }
}

export class IngredientInputTable {
    constructor(path) {
        this.path = path;
        this.isGenerated = false;
        /** @type {IngredientInputRow[]} */
        this.rows = [];
        /** @type {string} */
        this.ingredientsSnapshot = "";
    }

    generate(mb, ingredients = {}) {
        this.mb = mb;
        this.ingredientsSnapshot = ingredientsContentSignature(ingredients);
        this.rows = [];
        for (const id of listIngredientIds(ingredients)) {
            const ingredient = ingredients[id] || {};
            const row = new IngredientInputRow(this.path, id, ingredient.name || "ingredient");
            row.render(mb, ingredient.amount || 0, ingredient.unit || "");
            this.rows.push(row);
        }
        this.isGenerated = true;
    }

    /**
     * @returns {IngredientInputRow[]}
     */
    render(mb, ingredients = {}) {
        const nextSnapshot = ingredientsContentSignature(ingredients);
        if (!this.isGenerated || this.ingredientsSnapshot !== nextSnapshot) {
            this.generate(mb, ingredients);
        }
        return this.rows;
    }
}
