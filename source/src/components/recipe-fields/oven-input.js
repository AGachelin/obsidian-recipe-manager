import { UI_CLASSES } from "../../shared/constants/ui.js";
import { InputConfig } from "../config/input-config.js";
import { ViewConfig } from "../config/view-config.js";

export class OvenInput extends InputConfig {
    constructor(path) {
        super("number", null);
        this.path = path;
        this.isGenerated = false;
        this.lastView = null;
        this.value = null;
    }

    generate(mb, view, value = null) {
        this.isGenerated = true;
        this.lastView = view;
        this.value = value;
        const btOvenMem = mb.createBindTarget("memory", this.path, ["oven"], true);

        const n = value != null && value !== "" ? Number(value) : 0;
        mb.setMetadata(btOvenMem, Number.isFinite(n) ? n : 0);

        this.viewConfig = new ViewConfig("VIEW[{oven}]").render();
        this.view = mb.createViewFieldMountable(this.path, this.viewConfig);

        const declArgs = [{ name: "placeholder", value: ["Enter oven temperature"] }];
        if (value !== null && value !== undefined && value !== "") {
            declArgs.push({ name: "defaultValue", value: [`${value}`] });
        }
        const inputConfig = new InputConfig("number", btOvenMem, "inline", declArgs).render();
        this.inputField = mb.createInputFieldMountable(this.path, inputConfig);

        const viewDeclaration = "VIEW[bind({memory^oven}, 0, null)][math(hidden):oven]";
        this.bindViewConfig = new ViewConfig(viewDeclaration).render();
        this.bindView = mb.createViewFieldMountable(this.path, this.bindViewConfig);
    }

    /**
     * @returns {Array<{ parent: HTMLElement, field: unknown }>}
     */
    layoutMDRC(mb, container, view, value = null) {
        if (!this.isGenerated || this.value !== value || this.lastView !== view) {
            this.generate(mb, view, value);
        }

        if (!view) {
            const inputWrapper = container.createEl("div", {
                cls: `${UI_CLASSES.INPUT_FIELD} oven-input`,
            });
            inputWrapper.createEl("label", { text: "Oven Temperature: " });
            return [
                { parent: inputWrapper, field: this.inputField },
                {
                    parent: inputWrapper,
                    wrapperCls: UI_CLASSES.HIDDEN_VIEW_FIELD,
                    field: this.bindView,
                },
            ];
        }
        const viewWrapper = container.createEl("div", { cls: `${UI_CLASSES.VIEW_FIELD} oven-view` });
        viewWrapper.createEl("label", { text: "Oven: " });
        const mountSlot = viewWrapper.createEl("span", { cls: "oven-view-mdrc" });
        viewWrapper.createEl("span", { text: " °C" });
        return [{ parent: mountSlot, field: this.view }];
    }
}
