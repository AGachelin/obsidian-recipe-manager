import { FRONTMATTER } from "../shared/constants/recipe.js";
import { ButtonConfig } from "./config/button-config.js";

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

        this.viewModeButtonConfig = new ButtonConfig("switch-mode-view", "Read", "edit", "default", false);
        this.viewModeButtonConfig.addUpdateMetadataAction(bindKey, true)

        this.editModeButtonConfig = new ButtonConfig("switch-mode-edit", "Edit", "edit",  "default", false);
        this.editModeButtonConfig.addUpdateMetadataAction(bindKey, false)

        this.viewModeButtonOptions = this.viewModeButtonConfig.render();
        this.editModeButtonOptions = this.editModeButtonConfig.render();

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
