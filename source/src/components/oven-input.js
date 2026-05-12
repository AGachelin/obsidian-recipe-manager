import { UI_CLASSES } from "../shared/constants/ui.js";
import { InputConfig } from "./config/input-config.js";
import { ViewConfig } from "./config/view-config.js";

export class OvenInput extends InputConfig {
    constructor(path) {
        super("number", null);
        this.generated = false;
        this.path = path;
        this.lastView = null;
    }

    generate(mb, view, value = null) {
        this.generated = true;
        this.lastView = view;
        const btOven = mb.parseBindTarget("oven", this.path);
        this.bindTarget = btOven;
        const btOvenMem = mb.createBindTarget("memory", this.path, ["oven"], true);

        const n = value != null && value !== "" ? Number(value) : 0;
        mb.setMetadata(btOvenMem, Number.isFinite(n) ? n : 0);

        this.viewConfig = new ViewConfig("math", btOven).render("VIEW[{oven}]");
        this.view = mb.createViewFieldMountable(this.path, this.viewConfig);

        const declArgs = [{ name: "placeholder", value: ["Enter oven temperature"] }];
        if (value !== null && value !== undefined && value !== "") {
            declArgs.push({ name: "defaultValue", value: [`${value}`] });
        }
        const inputConfig = new InputConfig("number", btOvenMem, "inline", declArgs).render();
        this.inputField = mb.createInputFieldMountable(this.path, inputConfig);

        const viewDeclaration = "VIEW[bind({memory^oven}, 0, null)][math(hidden):oven]";
        this.bindViewConfig = new ViewConfig("math", btOven).render(viewDeclaration);
        this.bindView = mb.createViewFieldMountable(this.path, this.bindViewConfig);
        this.value = value;
    }

    /**
     * @returns {Array<{ parent: HTMLElement, field: unknown }>}
     */
    layoutMDRC(mb, container, view, value = null) {
        if (!this.generated || this.value !== value || this.lastView !== view) {
            this.generate(mb, view, value);
        }

        if (!view) {
            const inputWrapper = container.createEl("div", { cls: "input-field oven-input" });
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
        const viewWrapper = container.createEl("div", { cls: "view-field oven-view" });
        viewWrapper.createEl("label", { text: "Oven: " });
        const mountSlot = viewWrapper.createEl("span", { cls: "oven-view-mdrc" });
        viewWrapper.createEl("span", { text: " °C" });
        return [{ parent: mountSlot, field: this.view }];
    }
}
