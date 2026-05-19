import { FRONTMATTER } from "../../shared/constants/recipe.js";
import { ButtonConfig } from "../config/button-config.js";
import { getUILabels } from "../../shared/i18n/index.js";

export class ToggleButton {
    constructor(path, lang) {
        this.path = path;
        this.isGenerated = false;
        this.lang = lang;
        this.UI_LABELS = getUILabels(lang);
    }

    generate(mb, isViewMode) {
        this.isGenerated = true;
        this.mb = mb;
        this.isViewMode = isViewMode;

        const bindKey = FRONTMATTER.VIEW;

        this.viewModeButtonConfig = new ButtonConfig("switch-mode-view", this.UI_LABELS.READ, "edit");
        this.viewModeButtonConfig.addUpdateMetadataAction(bindKey, true)

        this.editModeButtonConfig = new ButtonConfig("switch-mode-edit", this.UI_LABELS.EDIT, "edit");
        this.editModeButtonConfig.addUpdateMetadataAction(bindKey, false)

        this.viewModeButtonOptions = this.viewModeButtonConfig.render(false);
        this.editModeButtonOptions = this.editModeButtonConfig.render(false);

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
