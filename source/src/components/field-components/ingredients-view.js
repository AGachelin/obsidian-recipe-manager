import {ViewConfig} from "../config/view-config.js";

class IngredientViewRow {
    constructor(path, id, name, amount = 0, unit = '') {
        this.path = path;
        this.id = id;
        this.name = name;
        this.amount = amount;
        this.unit = unit;
        this.viewDeclaration = {
            amount: `VIEW[convertBack({ingredients["${this.id}"].unit}, {ingredients["${this.id}"].amount}, {ingredients["${this.id}"].name}, {person.current}/{person.raw})]`,
            unit: `VIEW[{ingredients["${this.id}"].unit}]`,
            name: `VIEW[{ingredients["${this.id}"].name}]`
        }
        this.viewConfigs = {
            amount: new ViewConfig('text', null).render(this.viewDeclaration.amount),
            unit: new ViewConfig('text', null).render(this.viewDeclaration.unit),
            name: new ViewConfig('text', null).render(this.viewDeclaration.name)
        }
        this.isGenerated = false;
    }

    generate(mb) {
        this.isGenerated = true;
        this.mb = mb;
        if (!this.amount) {
            this.fields = [mb.createViewFieldMountable(this.path, this.viewConfigs.name)];
        } else if (this.unit === "") {
            this.fields = [mb.createViewFieldMountable(this.path, this.viewConfigs.amount),mb.createViewFieldMountable(this.path, this.viewConfigs.unit), mb.createViewFieldMountable(this.path, this.viewConfigs.name)];
        } else {
            this.fields = [mb.createViewFieldMountable(this.path, this.viewConfigs.amount), mb.createViewFieldMountable(this.path, this.viewConfigs.name)];
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
        this.previousIngredientIds = [];
    }

    generate(mb, ingredients) {
        this.mb = mb;
        this.ingredients = JSON.stringify(ingredients);
        this.fields = [];
        const ingredientIds = Object.keys(ingredients).filter(key => key !== "last_id");
        ingredientIds.forEach(id => {
            const ingredient = ingredients[id];
            const row = new IngredientViewRow(this.path, id, ingredient.name, ingredient.amount, ingredient.unit);
            this.fields.push(row.render(mb));
        });
        
        this.previousIngredientIds = ingredientIds;
        this.isGenerated = true;
    }

    render(mb, ingredients) {
        const ingredientIds = Object.keys(ingredients).filter(key => key !== "last_id");
        const ingredientString = JSON.stringify(ingredients);
        
        if (!this.isGenerated || this.ingredients !== ingredientString || this.previousIngredientIds.length !== ingredientIds.length) {
            this.generate(mb, ingredients);
        }
        return this.fields;
    }
}
