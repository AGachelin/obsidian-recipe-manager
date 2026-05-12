import { InputConfig } from "./config/input-config.js";
import { ViewConfig } from "./config/view-config.js";

export class SourceInput extends InputConfig {
    constructor(path) {
        super("text", null);
        this.path = path;
    }

    generate(mb, view, value = null) {
        const btSource = mb.parseBindTarget("source", this.path);
        this.bindTarget = btSource;
        this.viewConfig = new ViewConfig("text", btSource).render("VIEW[{source}][text(renderMarkdown)]");
        this.view = mb.createViewFieldMountable(this.path, this.viewConfig);
        this.declaration_arguments = [{ name: "placeholder", value: ["Enter source"] }];
        if (value !== null) {
            this.defaultValue = [`${value}`];
            this.declaration_arguments.push({ name: "defaultValue", value: this.defaultValue });
        }
        this.config = super.render();
        this.inputField = mb.createInputFieldMountable(this.path, this.config);
    }

    /**
     * @returns {Array<{ parent: HTMLElement, field: unknown }>}
     */
    layoutMDRC(view, container, mb) {
        if (!this.inputField) {
            this.generate(mb, view);
        }
        if (!view) {
            const inputWrapper = container.createEl("div", { cls: "input-field source-input" });
            inputWrapper.createEl("label", { text: "Source: " });
            return [{ parent: inputWrapper, field: this.inputField }];
        }
        const viewWrapper = container.createEl("div", { cls: "view-field source-view" });
        viewWrapper.createEl("strong", { text: "Source: " });
        return [{ parent: viewWrapper, field: this.view }];
    }
}
