import { RECIPE_LAYOUT } from "../../shared/constants/recipe-ui.js";
import { InputConfig } from "../config/input-config.js";
import { ViewConfig } from "../config/view-config.js";

export class ThumbnailInput extends InputConfig {
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
        const btThumbnail = mb.parseBindTarget("thumbnail", this.path);
        this.bindTarget = btThumbnail;
        this.viewConfig = new ViewConfig("VIEW[{thumbnail}][text]").render();
        this.view = mb.createViewFieldMountable(this.path, this.viewConfig);
        this.declarationArguments = [{ name: "placeholder", value: ["Image path or wikilink"] }];
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
            const inputWrapper = container.createDiv({
                cls: `${RECIPE_LAYOUT.inputField} thumbnail-input`,
            });
            inputWrapper.createEl("label", { text: "Thumbnail: " });
            return [{ parent: inputWrapper, field: this.inputField }];
        }
        return [];
    }
}
