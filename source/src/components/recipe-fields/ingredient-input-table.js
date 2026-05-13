import { UNIT_OPTIONS, UNIT_LABELS } from "../../shared/constants/custom_units.js";
import { FRONTMATTER } from "../../shared/constants/recipe.js";
import {
    bindIngredientMemory,
    ingredientsContentSignature,
    ingredientEntry,
    listIngredientIds,
} from "../../shared/ingredients-utils.js";
import { convertBackAmount } from "../../shared/startup/math-units.js";
import { UI_CLASSES, UI_LABELS } from "../../shared/constants/ui.js";
import { InputConfig } from "../config/input-config.js";

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
        this._canonicalAmount = 0;
        this._unit = "";
    }

    amountCanonicalViewString() {
        const id = this.id;
        return `VIEW[bind(convert({memory^ingredients["${id}"]["unit"]}, {memory^ingredients["${id}"]["amount"]}, {memory^ingredients["${id}"]["name"]}), 0, null)][math(hidden):ingredients["${id}"].amount]`;
    }

    unitSyncViewString() {
        const id = this.id;
        return `VIEW[{memory^ingredients["${id}"]["unit"]}][text(hidden):ingredients["${id}"].unit]`;
    }

    generate(mb, amount = 0, unit = "") {
        this.isGenerated = true;
        this.mb = mb;
        const raw = Number(amount);
        this._canonicalAmount = Number.isFinite(raw) ? raw : 0;
        this._unit = unit;

        const display = convertBackAmount(mb, unit, this._canonicalAmount, this.name);
        const memoryAmount = Number.isFinite(Number(display)) ? Number(display) : this._canonicalAmount;

        this.bindTargetAmountMemory = bindIngredientMemory(mb, this.path, this.id, "amount");
        this.bindTargetUnitMemory = bindIngredientMemory(mb, this.path, this.id, "unit");
        this.bindTargetNameMemory = bindIngredientMemory(mb, this.path, this.id, "name");

        mb.setMetadata(this.bindTargetAmountMemory, memoryAmount);
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
                    bindTarget: FRONTMATTER.AVAILABLE_INGREDIENTS,
                    evaluate: true,
                    value: `x==null?["${this.name}"]:["${this.name}",...x]`,
                },
                {
                    type: "updateMetadata",
                    bindTarget: FRONTMATTER.INGREDIENTS,
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

        this.deleteButton = mb.createButtonMountable(this.path, {
            declaration: this.deleteButtonConfig,
            isPreview: false,
        });
        this.changeButton = mb.createButtonMountable(this.path, {
            declaration: this.changeButtonConfig,
            isPreview: false,
        });
        this.amountInput = mb.createInputFieldMountable(this.path, this.createAmountInputConfig(memoryAmount));
        this.amountHiddenView = mb.createViewFieldMountable(this.path, {
            renderChildType: "inline",
            declaration: this.amountCanonicalViewString(),
        });
        this.unitSyncView = mb.createViewFieldMountable(this.path, {
            renderChildType: "inline",
            declaration: this.unitSyncViewString(),
        });
        this.unitSelect = mb.createInputFieldMountable(this.path, this.createUnitSelectConfig(unit));
    }

    createAmountInputConfig(amount = 0) {
        return new InputConfig("number", this.bindTargetAmountMemory, "inline", [
            { name: "defaultValue", value: [`${Number(amount) || 0}`] },
        ]).render();
    }

    createUnitSelectConfig(unit = "") {
        return new InputConfig("inlineSelect", this.bindTargetUnitMemory, "inline", [
            ...this.unitOptionArguments,
            { name: "defaultValue", value: [`${unit}`] },
        ]).render();
    }

    render(mb, amount = 0, unit = "") {
        const raw = Number(amount);
        const canonical = Number.isFinite(raw) ? raw : 0;
        if (!this.isGenerated || this._canonicalAmount !== canonical || this._unit !== unit) {
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
            const rowData = ingredientEntry(ingredients, id);
            const row = new IngredientInputRow(this.path, id, rowData.name);
            row.render(mb, rowData.amount, rowData.unit);
            this.rows.push(row);
        }
        this.isGenerated = true;
    }

    discardMountables() {
        this.isGenerated = false;
        this.rows = [];
        this.ingredientsSnapshot = "";
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
