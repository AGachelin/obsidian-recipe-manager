import { UI_LABELS } from "../shared/constants/ui.js";

export class AddIngredientButton {
    constructor(path) {
        this.path = path;
        this.newButtonConfig = {
            id: "new-ingredient",
            style: "default",
            label: UI_LABELS.NEW_INGREDIENT,
            hidden: true,
            action: {
                type: "templaterCreateNote",
                templateFile: "source/templates/ingredient_template.md",
                folderPath: "Ingredients",
                fileName: "ing",
            },
        };
        this.addButtonConfig = {
            id: "add-ingredient",
            style: "default",
            label: UI_LABELS.ADD_INGREDIENT,
            hidden: true,
            action: {
                type: "js",
                file: "source/src/components/ingredients-input.js",
            },
        };

        this.addButtonOptions = {
            declaration: this.addButtonConfig,
            isPreview: false,
        };

        this.newButtonOptions = {
            declaration: this.newButtonConfig,
            isPreview: false,
        };

        this.buttonGroupOptions = {
            declaration: { referencedButtonIds: ["add-ingredient", "new-ingredient"] },
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
