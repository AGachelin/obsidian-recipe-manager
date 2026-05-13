import { FRONTMATTER } from "../shared/constants/recipe.js";

export class ToggleButton {
    constructor(path) {
        this.path = path;
        this.isGenerated = false;
    }

    generate(mb, isViewMode) {
        this.isGenerated = true;
        this.mb = mb;
        this.isViewMode = isViewMode;

        const bindKey = FRONTMATTER.VIEW;

        this.viewModeButtonConfig = {
            id: "switch-mode-view",
            style: "default",
            label: "Read",
            class: "edit",
            hidden: false,
            action: {
                type: "updateMetadata",
                bindTarget: bindKey,
                evaluate: true,
                value: true,
            },
        };

        this.editModeButtonConfig = {
            id: "switch-mode-edit",
            style: "default",
            label: "Edit",
            class: "edit",
            hidden: false,
            action: {
                type: "updateMetadata",
                bindTarget: bindKey,
                evaluate: true,
                value: false,
            },
        };

        this.viewModeButtonOptions = {
            declaration: this.viewModeButtonConfig,
            isPreview: false,
        };

        this.editModeButtonOptions = {
            declaration: this.editModeButtonConfig,
            isPreview: false,
        };

        const buttonOptions = isViewMode ? this.editModeButtonOptions : this.viewModeButtonOptions;
        this.toggleButton = mb.createButtonMountable(this.path, buttonOptions);
    }

    render(mb, isViewMode) {
        if (!this.isGenerated || this.isViewMode !== isViewMode) {
            this.generate(mb, isViewMode);
        }
        return [this.toggleButton];
    }
}
