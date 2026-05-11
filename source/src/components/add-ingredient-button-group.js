import { UI_LABELS } from "../shared/constants/ui.js";

export class AddIngredientButton {
    constructor(path) {
        this.path = path;
        this.newButtonConfig = {
            id: 'new-ingredient',
			style: 'default',
			label: UI_LABELS.NEW_INGREDIENT,
			hidden: true,
			action: {
				type: 'templaterCreateNote',
				templateFile: 'source/templates/ingredient_template.md',
				folderPath: 'Ingredients',
				fileName: 'ing'
			}
		}
        this.addButtonConfig = {
			id: 'add-ingredient',
			style: 'default',
			label: UI_LABELS.ADD_INGREDIENT,
			hidden: true,
			action: {
				type: 'js',
				file: 'source/src/components/ingredients-input.js'
			}
		}

		this.addButtonOptions = {
		    declaration: this.addButtonConfig,
		    isPreview: false
		};

		this.newButtonOptions = {
		    declaration: this.newButtonConfig,
		    isPreview: false
		};

		this.buttonGroupOptions = {
			declaration: {referencedButtonIds:['add-ingredient','new-ingredient']},
			renderChildType:'inline',
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

	render(mb, container, component) {
		if (!this.isGenerated) {
			this.generate(mb);
		}
		
		this.container = container;
		this.component = component;

		mb.wrapInMDRC(this.newButton, container, component);
		mb.wrapInMDRC(this.addButton, container, component);
		mb.wrapInMDRC(this.buttonGroup, container, component);
	}
}
