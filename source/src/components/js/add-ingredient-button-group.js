export class AddIngredientButton {
    constructor(path) {
        this.path = path;
        this.newButtonConfig = {
            id: 'new-ingredient',
			style: 'default',
			label: 'new ingredient',
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
			label: 'add ingredient',
			hidden: false,
			action: {
				type: 'js',
				file: 'source/src/components/js/ingredients-input.js'
			}
		}

		this.addButtonOptions = {
		    declaration: AddButtonConfig,
		    isPreview: false
		};

		this.newButtonOptions = {
		    declaration: NewButtonConfig,
		    isPreview: false
		};

		this.buttonGroupOptions = {
			declaration: {referencedButtonIds:['add-ingredient','new-ingredient']},
			renderChildType:'inline',
		};
    }

    render(mb) {
        this.addButton = mb.createButtonMountable(this.path, this.addButtonOptions);
        this.newButton = mb.createButtonMountable(this.path, this.newButtonOptions);
		this.buttonGroup = mb.createButtonGroupMountable(this.path, this.buttonGroupOptions);
        return [this.addButton, this.newButton, this.buttonGroup];
    }
}
