import { INGREDIENT_FRONTMATTER } from "../../shared/constants/ingredient.js";
import { INGREDIENT_LAYOUT } from "../../shared/constants/ingredient-ui.js";
import { UI_CLASSES } from "../../shared/constants/ui.js";
import { InputConfig } from "../config/input-config.js";
import { ViewConfig } from "../config/view-config.js";
import { applyMdrcLayoutSteps } from "../../lib/render/mdrc-layout.js";

export class WeightInput {
    /**
     * @param {string} path
     * @param {string} frontmatterKey
     * @param {string} label
     */
    constructor(path, frontmatterKey, label) {
        this.path = path;
        this.frontmatterKey = frontmatterKey;
        this.label = label;
        this.isGenerated = false;
    }

    /**
     * @param {*} mb
     * @param {number} value
     */
    generate(mb, value = 1) {
        this.isGenerated = true;
        this.mb = mb;
        const n = Number(value);
        const num = Number.isFinite(n) ? n : 1;

        const memTarget = mb.createBindTarget("memory", this.path, [this.frontmatterKey], true);
        mb.setMetadata(memTarget, num);

        this.inputField = mb.createInputFieldMountable(
            this.path,
            new InputConfig("number", memTarget, "inline", [
                { name: "defaultValue", value: [`${num}`] },
            ]).render()
        );

        const hiddenDecl = `VIEW[bind({memory^${this.frontmatterKey}}, 0, null)][math(hidden):${this.frontmatterKey}]`;
        this.hiddenView = mb.createViewFieldMountable(
            this.path,
            new ViewConfig(hiddenDecl).render()
        );
    }

    /**
     * @param {*} mb
     * @param {import("obsidian").Component} component
     * @param {HTMLElement} parent
     * @param {number} value
     */
    mount(mb, component, parent, value) {
        const n = Number(value);
        if (!this.isGenerated || this._value !== n) {
            this._value = n;
            this.generate(mb, value);
        }

        const row = parent.createDiv({ cls: INGREDIENT_LAYOUT.fieldRow });
        row.createEl("label", { cls: INGREDIENT_LAYOUT.fieldLabel, text: this.label });
        const inputWrap = row.createDiv({ cls: INGREDIENT_LAYOUT.fieldInput });
        applyMdrcLayoutSteps(mb, component, [
            { parent: inputWrap, field: this.inputField },
            {
                parent: row.createDiv(),
                wrapperCls: UI_CLASSES.HIDDEN_VIEW_FIELD,
                field: this.hiddenView,
            },
        ]);
    }
}
