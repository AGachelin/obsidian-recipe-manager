import { UI_CLASSES } from "../../shared/constants/ui.js";
import { InputConfig } from "../config/input-config.js";
import { ViewConfig } from "../config/view-config.js";

export class SourceInput extends InputConfig {
    constructor(path) {
        super("text", null);
        this.path = path;
        this.isGenerated = false;
        this.lastView = null;
        this.lastValue = null;
    }

    generate(mb, view, value = null) {
        this.isGenerated = true;
        this.lastView = view;
        this.lastValue = value;
        const btSource = mb.parseBindTarget("source", this.path);
        this.bindTarget = btSource;
        this.viewConfig = new ViewConfig("VIEW[{source}][text(renderMarkdown)]").render();
        this.view = mb.createViewFieldMountable(this.path, this.viewConfig);
        this.declarationArguments = [{ name: "placeholder", value: ["Enter source"] }];
        if (value !== null && value !== undefined) {
            this.declarationArguments.push({ name: "defaultValue", value: [`${value}`] });
        }
        this.config = super.render();
        this.inputField = mb.createInputFieldMountable(this.path, this.config);
    }

    layoutMDRC(mb, container, view, value = null) {
        if (!this.isGenerated || this.lastView !== view || this.lastValue !== value) {
            this.generate(mb, view, value);
        }
        if (!view) {
            const inputWrapper = container.createEl("div", {
                cls: `${UI_CLASSES.INPUT_FIELD} source-input`,
            });
            inputWrapper.createEl("label", { text: "Source: " });
            return [{ parent: inputWrapper, field: this.inputField }];
        }
        const viewWrapper = container.createEl("div", { cls: `${UI_CLASSES.VIEW_FIELD} source-view` });
        viewWrapper.createEl("strong", { text: "Source: " });
        return [{ parent: viewWrapper, field: this.view }];
    }
}
