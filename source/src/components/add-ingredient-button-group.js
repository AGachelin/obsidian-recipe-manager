import { UI_LABELS } from "../shared/constants/ui.js";
import {ButtonConfig} from "./config/button-config.js"

export class AddIngredientButton {
    constructor(path) {
        this.path = path;
        this.newButtonConfig = new ButtonConfig("new-ingredient", UI_LABELS.NEW_INGREDIENT);
        this.newButtonConfig.addTemplaterCreateNoteAction(
            "source/templates/ingredient_template.md",
            "Ingredients",
            "ing"
        );
        this.addButtonConfig = new ButtonConfig("add-ingredient", UI_LABELS.ADD_INGREDIENT);
        this.addButtonConfig.addJsAction("source/src/components/ingredients-input.js");
        
        this.addButtonOptions = this.addButtonConfig.render();
        this.newButtonOptions = this.newButtonConfig.render();

        this.buttonGroupOptions = {
            declaration: {referencedButtonIds: [this.addButtonConfig.getId(), this.newButtonConfig.getId()]},
            renderChildType: "inline",
        };
        this.isGenerated = false;
    }

    generate(mb) {
        this.isGenerated = true;
        this.mb = mb;
        this.addButton = mb.createButtonMountable(this.path, this.addButtonOptions);
        this.newButton = mb.createButtonMountable(this.path, this.newButtonOptions);
        this.buttonGroup = mb.createButtonGroupMountable(this.path, this.buttonGroupOptions);
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
            { parent: container, field: this.addButton },
            { parent: container, field: this.buttonGroup },
        ];
    }
}
