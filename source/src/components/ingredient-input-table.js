import {UNIT_OPTIONS, UNIT_LABELS} from "../shared/constants/custom_units.js";
import {UI_LABELS} from "../shared/constants/ui.js";
import {InputConfig} from "./input-config.js";
import {ViewConfig} from "./view-config.js";

class IngredientInputRow {
    constructor(path, id, name) {
        this.path = path;
        this.id = id;
        this.name = name;
        this.unitOptionArguments = [
            { name: 'option', value: [''] },
            ...UNIT_OPTIONS.map((unit, index) => ({
                name: 'option',
                value: [unit, UNIT_LABELS[index]]
            }))
        ];
        this.isGenerated = false;
    }

    generate(mb, amount = 0, unit = '') {
        this.isGenerated = true;
        this.mb = mb;
        this.amount = amount;
        this.unit = unit;
        
        const btAvailableIngredients ='available_ingredients';
        const btIngredients ='ingredients';
        
        this.bindTargetAmountMemory = mb.createBindTarget(
            'memory',
            this.path,
            ["ingredients", `${this.id}`, "amount"],
            true
        );
        this.bindTargetAmountFrontmatter = mb.createBindTarget(
            'frontmatter',
            this.path,
            ["ingredients", `${this.id}`, "amount"],
            true
        );
        this.bindTargetUnit = mb.createBindTarget('frontmatter', this.path, ["ingredients", `${this.id}`, "unit"], true);

        mb.setMetadata(this.bindTargetAmountMemory, Number(amount));

        this.deleteButtonConfig = {
            id: `delete-${this.id}`,
            style: 'default',
            label: UI_LABELS.DELETE,
            hidden: false,
            actions: [
                {
                    type: "updateMetadata",
                    bindTarget: btAvailableIngredients,
                    evaluate: true,
                    value: `x==null?["${this.name}"]:["${this.name}",...x]`
                },
                {
                    type: "updateMetadata",
                    bindTarget: btIngredients,
                    evaluate: true,
                    value: `(delete x["${this.id}"])?x:x`
                }
            ]
        };

        this.changeButtonConfig = {
            id: `ingredient-${this.id}`,
            style: 'default',
            label: `${this.name}`,
            hidden: false,
            action: {
                type: 'js',
                file: 'source/src/components/ingredients-input.js',
                args: { id: this.id }
            }
        };

        this.deleteButtonOptions = {
            declaration: this.deleteButtonConfig,
            isPreview: false
        };

        this.changeButtonOptions = {
            declaration: this.changeButtonConfig,
            isPreview: false
        };

        this.deleteButton = mb.createButtonMountable(this.path, this.deleteButtonOptions);
        this.changeButton = mb.createButtonMountable(this.path, this.changeButtonOptions);
        this.amountInput = mb.createInputFieldMountable(this.path, this.createAmountInputConfig(amount));
        this.amountHiddenView = mb.createViewFieldMountable(this.path, this.createConvertViewConfig());
        this.unitSelect = mb.createInputFieldMountable(this.path, this.createUnitSelectConfig(unit));
    }

    createAmountInputConfig(amount = 0) {
        return new InputConfig(
            'number',
            this.bindTargetAmountMemory,
            'inline',
            [{ name: 'defaultValue', value: [`${amount}`] }]
        ).render();
    }

    createUnitSelectConfig(unit = '') {
        return new InputConfig(
            'inlineSelect',
            this.bindTargetUnit,
            'inline',
            this.unitOptionArguments.concat([{ name: 'defaultValue', value: [`${unit}`] }])
        ).render();
    }

    createConvertViewConfig() {
        const declaration = `VIEW[bind(convert({ingredients["${this.id}"]["unit"]}, {memory^ingredients["${this.id}"]["amount"]}, {ingredients["${this.id}"]["name"]}), 0, null)][math(hidden):ingredients["${this.id}"]["amount"]]`;
        const conf = new ViewConfig('math', this.bindTargetAmountFrontmatter).render(declaration);
        return conf;
    }

    render(mb, amount = 0, unit = '') {
        if (!this.isGenerated || this.amount !== amount || this.unit !== unit) {
            this.generate(mb, amount, unit);
        }
        return [
            this.changeButton,
            this.amountInput,
            this.amountHiddenView,
            this.unitSelect,
            this.deleteButton
        ];
    }
}

export class IngredientInputTable {
    constructor(path) {
        this.path = path;
        this.isGenerated = false;
        this.rowById = new Map();
    }

    generate(mb, ingredients = {}) {
        this.isGenerated = true;
        this.mb = mb;
        this.ingredients = ingredients;
        this.fields = [];
        const ingredientIds = Object.keys(ingredients)
            .filter((id) => id !== 'last_id')
            .sort((a, b) => Number(a) - Number(b));
        const nextIds = new Set(ingredientIds);

        for (const id of this.rowById.keys()) {
            if (!nextIds.has(id)) {
                this.rowById.delete(id);
            }
        }

        for (const id of ingredientIds) {
            const ingredient = ingredients[id] || {};
            const name = ingredient.name || "ingredient";
            let row = this.rowById.get(id);
            if (!row || row.name !== name) {
                row = new IngredientInputRow(this.path, id, name);
                this.rowById.set(id, row);
            }
            this.fields.push(row.render(mb, ingredient.amount ?? 0, ingredient.unit ?? ""));
        }
    }

    render(mb, ingredients = {}) {
        this.generate(mb, ingredients);
        return this.fields;
    }
}
