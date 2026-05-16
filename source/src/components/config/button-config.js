export class ButtonConfig {
    /**
     * @param {string} id
     * @param {string} label
     * @param {string | null} [cssClass]
     * @param {string} [style]
     * @param {boolean} [isPreview]
     */
    constructor(id, label, cssClass = null, style = "default", isPreview = false) {
        this.id = id;
        this.style = style;
        this.label = label;
        this.actions = [];
        this.isPreview = isPreview;
        this.cssClass = cssClass;
    }

    /** @param {Record<string, unknown>} action */
    addAction(action) {
        this.actions.push(action);
    }

    addTemplaterCreateNoteAction(templateFile, folderPath, fileName) {
        this.addAction({
            type: "templaterCreateNote",
            templateFile,
            folderPath,
            fileName,
        });
    }

    /** @param {string} file */
    addJsAction(file, args = null) {
        const action = { type: "js", file };
        if (args != null) {
            action.args = args;
        }
        this.addAction(action);
    }

    addUpdateMetadataAction(bindTarget, value, evaluate = true) {
        this.addAction({
            type: "updateMetadata",
            bindTarget,
            evaluate,
            value,
        });
    }

    /** @param {boolean} [hidden] */
    render(hidden = true) {
        const declaration = {
            id: this.id,
            style: this.style,
            label: this.label,
            hidden,
        };
        if (this.cssClass) {
            declaration.class = this.cssClass;
        }
        if (this.actions.length === 1) {
            declaration.action = this.actions[0];
        } else {
            declaration.actions = this.actions;
        }
        return {
            declaration,
            isPreview: this.isPreview,
        };
    }

    getId() {
        return this.id;
    }
}
