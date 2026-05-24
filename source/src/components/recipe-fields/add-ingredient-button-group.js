import { getUILabels } from "../../shared/constants/ui.js";
import {ButtonConfig} from "../config/button-config.js"

export class NewIngredientButton {
    constructor(path, lang) {
        this.UI_LABELS = getUILabels(lang)
        this.path = path;
        this.newButtonConfig = new ButtonConfig("new-ingredient", this.UI_LABELS.NEW_INGREDIENT);
        this.newButtonConfig.addTemplaterCreateNoteAction(
            "source/templates/ingredient_template.md",
            "Ingredients",
            "ing"
        );
        this.newButtonOptions = this.newButtonConfig.render();

        this.isGenerated = false;
    }

    generate(mb) {
        this.isGenerated = true;
        this.mb = mb;
        this.newButton = mb.createButtonMountable(this.path, this.newButtonOptions);
    }

    /**
     * @returns {Array<{ parent: HTMLElement, field: unknown }>}
     */
    layoutMDRC(mb, container) {
        if (!this.isGenerated) {
            this.generate(mb);
        }
        return [
            { parent: container, field: this.newButton },
        ];
    }
}
