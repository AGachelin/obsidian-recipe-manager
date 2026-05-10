export class AddIngredientButton {
    constructor(path) {
        this.path = path;
        this.viewModeButtonConfig = {
            id: 'switch-mode-view',
			style: 'default',
			label: 'View',
            class: 'edit',
			hidden: false,
			action: {
				type: 'updateMetadata',
				bindTarget: 'view',
				evaluate: false,
				value: true
			}
		}

        this.editModeButtonConfig = {
            id: 'switch-mode-edit',
			style: 'default',
			label: 'Edit',
            class: 'edit',
			hidden: false,
			action: {
				type: 'updateMetadata',
				bindTarget: 'view',
				evaluate: false,
				value: false
			}
		}

		this.viewModeButtonOptions = {
		    declaration: this.viewModeButtonConfig,
		    isPreview: false
		};

		this.editModeButtonOptions = {
		    declaration: this.editModeButtonConfig,
		    isPreview: false
		};
        this.isGenerated = false;
    }

    generate(mb, isViewMode) {
        this.isGenerated = true;
        this.mb = mb;
        this.isViewMode = isViewMode;
        const buttonOptions = isViewMode ? this.viewModeButtonOptions : this.editModeButtonOptions;
        this.toggleButton = mb.createButtonMountable(this.path, buttonOptions);
    }

    render(mb, isViewMode) {
        if (!this.isGenerated || this.isViewMode !== isViewMode) {
            this.generate(mb, isViewMode);
        }
        return [this.toggleButton];
    }
}
