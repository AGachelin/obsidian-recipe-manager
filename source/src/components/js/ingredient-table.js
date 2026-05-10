import {UNIT_OPTIONS, UNIT_LABELS} from "../../shared/constants/custom_units.js";
import {InputConfig} from "./input-config.js";
import {ViewConfig} from "./view-config.js";

class rowConfig {
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

        this.deleteButtonConfig = {
            id: `delete-${id}`,
            style: 'default',
            label: 'x',
            hidden: false,
            actions: [
                {
                    type: "updateMetadata",
                    bindTarget: "available_ingredients",
                    evaluate: true,
                    value: `x==null?["${name}"]:["${name}",...x]`
                },
                {
                    type: "updateMetadata",
                    bindTarget: "ingredients",
                    evaluate: true,
                    value: `(delete x["${id}"])?x:x`
                },
                {
                    type: "updateMetadata",
                    bindTarget: "ingredients",
                    evaluate: true,
                    value: `(delete x["${id}"])?x:x`
                }
            ]
        };

        this.changeButtonConfig = {
            id: `ingredient-${id}`,
            style: 'default',
            label: `${name}`,
            hidden: false,
            action: {
                type: 'js',
                file: 'source/src/components/ingredients-input.js',
                args: { id: id }
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
    }

    createAmountInputConfig(amount = 0) {
        return new InputConfig(
            'number',
            this.bindTargetAmount,
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
        return new ViewConfig('math', this.bindTargetAmount_view).render(declaration);
    }

    render(mb, amount = 0, unit = '') {
        this.bindTargetAmount ??= mb.createBindTarget('memory', this.path, ["ingredients", `${this.id}`, "amount"]);
        this.bindTargetAmount_view ??= mb.createBindTarget('frontmatter', this.path, ["ingredients", `${this.id}`, "amount"]);
        this.bindTargetUnit ??= mb.createBindTarget('frontmatter', this.path, ["ingredients", `${this.id}`, "unit"]);

        this.deleteButton = mb.createButtonMountable(this.path, this.deleteButtonOptions);
        this.changeButton = mb.createButtonMountable(this.path, this.changeButtonOptions);
        this.amountInput = mb.createInputFieldMountable(this.path, this.createAmountInputConfig(amount));
        this.amountHiddenView = mb.createViewFieldMountable(this.path, this.createConvertViewConfig());
        this.unitSelect = mb.createInputFieldMountable(this.path, this.createUnitSelectConfig(unit));

        return [
            this.changeButton,
            this.amountInput,
            this.amountHiddenView,
            this.unitSelect,
            this.deleteButton
        ];
    }
}

export class IngredientTable {
    constructor(path) {
        this.path = path;
    }

    render(mb, ingredients = {}) {
        const fields = [];
        const ingredientIds = Object.keys(ingredients)
            .filter((id) => id !== 'last_id')
            .sort();

        for (const id of ingredientIds) {
            const ingredient = ingredients[id] || {};
            const row = new rowConfig(this.path, id, ingredient.name || 'ingredient');
            fields.push(row.render(mb, ingredient.amount || 0, ingredient.unit || ''));
        }

        return fields;
    }
}
