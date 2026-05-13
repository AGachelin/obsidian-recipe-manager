import { UNIT_OPTIONS, UNIT_LABELS } from "../../shared/constants/custom_units.js";
import { FRONTMATTER } from "../../shared/constants/recipe.js";
import { ingredientsContentSignature, listIngredientIds } from "../../shared/ingredients-utils.js";
import { convertBackAmount } from "../../shared/startup/math-units.js";
import { UI_CLASSES, UI_LABELS } from "../../shared/constants/ui.js";
import { InputConfig } from "../config/input-config.js";

const FM = FRONTMATTER;

/**
 * @param {unknown} mb
 * @param {string} recipePath
 * @param {string} id
 * @param {"amount" | "unit" | "name"} leaf
 */
function memoryIngredientBind(mb, recipePath, id, leaf) {
    return mb.parseBindTarget(`memory^ingredients["${id}"]["${leaf}"]`, recipePath);
}

/**
 * Ingredient row (edit mode):
 * - Amount and unit **inputs** bind to **memory** (recipe-scoped).
 * - Hidden VIEW strings write canonical amount (`convert` + `bind`) and display unit to nested frontmatter.
 *
 * Note: `createViewFieldMountable` cannot use a structured `SimpleViewFieldDeclaration` object today — Meta Bind’s
 * API validator wires `viewFieldType` to **input** field types (`Validators.ts` → `V_SimpleViewFieldDeclaration`),
 * so `math` / `text` are rejected. Use full `VIEW[…]` strings until that upstream bug is fixed.
 */
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

    /**
     * @returns {string}
     */
    amountCanonicalViewString() {
        const id = this.id;
        return `VIEW[bind(convert({memory^ingredients["${id}"]["unit"]}, {memory^ingredients["${id}"]["amount"]}, {memory^ingredients["${id}"]["name"]}), 0, null)][math(hidden):ingredients["${id}"].amount]`;
    }

    /**
     * @returns {string}
     */
    unitSyncViewString() {
        const id = this.id;
        return `VIEW[{memory^ingredients["${id}"]["unit"]}][text(hidden):ingredients["${id}"].unit]`;
    }

    generate(mb, amount = 0, unit = "") {
        this.isGenerated = true;
        this.mb = mb;
        this.amount = convertBackAmount(mb, unit, amount, this.name);
        amount = this.amount;
        this.unit = unit;

        const btAvailable = FM.AVAILABLE_INGREDIENTS;
        const btIngredients = FM.INGREDIENTS;

        this.bindTargetAmountMemory = memoryIngredientBind(mb, this.path, this.id, "amount");
        this.bindTargetUnitMemory = memoryIngredientBind(mb, this.path, this.id, "unit");
        this.bindTargetNameMemory = memoryIngredientBind(mb, this.path, this.id, "name");

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

    /** Drop cached rows when leaving edit mode so VIEW mountables are not rebuilt until needed. */
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
