import { RECIPE_LAYOUT } from "../../shared/constants/recipe-ui.js";

export class Content {
    constructor(path) {
        this.path = path;
        this.view = "```meta-bind-embed\n[[content]]\n```";
        this.edit = "[[content|Modifier le contenu]]";
        this.mb = null;
    }

    generate(mb, view) {
        this.mb = mb;
        this.viewMode = view;
    }

    render(view, internal, container) {
        if (this.mb === null || this.viewMode !== view) {
            this.generate(this.mb, view);
        }
        if (!view) {
            const inputWrapper = container.createEl("div", {
                cls: `${RECIPE_LAYOUT.inputField} ${RECIPE_LAYOUT.contentInput}`,
            });
            internal.renderMarkdown(this.edit, inputWrapper, this.path);
        } else {
            const viewWrapper = container.createEl("div", {
                cls: `${RECIPE_LAYOUT.viewField} ${RECIPE_LAYOUT.contentView}`,
            });
            internal.renderMarkdown(this.view, viewWrapper, this.path);
        }
    }
}
