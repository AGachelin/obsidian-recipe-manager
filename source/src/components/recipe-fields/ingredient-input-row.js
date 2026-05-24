import { buildUnitSelectDeclarationArguments } from "../../shared/constants/custom-units.js";
import { FRONTMATTER } from "../../shared/constants/recipe.js";
import { bindIngredientMemory } from "../../shared/ingredients-utils.js";
import { convertBackAmount } from "../../shared/startup/math-units.js";
import { UI_CLASSES, getUILabels } from "../../shared/constants/ui.js";
import { RECIPE_LAYOUT } from "../../shared/constants/recipe-ui.js";
import { InputConfig } from "../config/input-config.js";
import { ButtonConfig } from "../config/button-config.js";

export class IngredientInputRow {
    /**
     * @param {string} path
     * @param {string} id
     * @param {string} name
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     */
    constructor(path, id, name, lang) {
        this.path = path;
        this.id = id;
        this.name = name;
        this.unitOptionArguments = buildUnitSelectDeclarationArguments();
        this.isGenerated = false;
        this.UI_LABELS = getUILabels(lang);
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

        this.deleteButtonConfig = new ButtonConfig(`delete-${this.id}`, this.UI_LABELS.DELETE);
        this.deleteButtonConfig.addUpdateMetadataAction(
            FRONTMATTER.INGREDIENTS,
            `(delete x["${this.id}"])?x:x`
        );

        this.deleteButton = mb.createButtonMountable(this.path, this.deleteButtonConfig.render(false));
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
     * @param {{ draggable?: boolean }} [options]
     * @returns {Array<{ parent: HTMLElement, field: unknown, wrapperCls?: string }>}
     */
    layoutSteps(rowEl, options = {}) {
        if (options.draggable) {
            rowEl.setAttr("draggable", "true");
            rowEl.dataset.ingredientRowId = String(this.id);
            rowEl.classList.add("ingredient-row--draggable");
        }
        rowEl.createEl("span", { cls: `${RECIPE_LAYOUT.ingredientRow}__name`, text: this.name });
        return [
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
