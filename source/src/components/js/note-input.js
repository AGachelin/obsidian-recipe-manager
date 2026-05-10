import { InputConfig } from "./input-config.js";
import { ViewConfig } from "./view-config.js";

export class NoteInput extends InputConfig {
    constructor(target, path) {
        super('number', target);
        this.path = path;
        this.viewDeclaration = "VIEW[clamp({memory^note}, 0, 5)][math(hidden):note]";
        this.clampViewConfig = new ViewConfig('math', this.target).render(this.viewDeclaration);
        this.isGenerated = false;
    }

    generate(mb, view, value=null) {
        this.isGenerated = true;
        this.mb = mb;
        this.viewMode = view;
        this.value = value;
        if(view) {
            this.viewConfig = new ViewConfig('math', this.target).render("View[{note}]");
            this.view = mb.createViewFieldMountable(this.path, this.viewConfig);
        } else {
            this.defaultValue = value !== null ? [`${value}`] : [];
            this.declaration_arguments = [{ name: 'defaultValue', value: this.defaultValue }];
            this.config = super.render();
            this.inputField = mb.createInputFieldMountable(this.path, this.config);
            this.clampView = mb.createViewFieldMountable(this.path, this.clampViewConfig);
        }
    }

    render(mb, view, value=null) {
        if (!this.isGenerated || this.viewMode !== view || this.value !== value) {
            this.generate(mb, view, value);
        }
        if(view) {
            return [this.view];
        } else {
            return [this.inputField, this.clampView];
        }
    }
}
// this should be used instead to view the note
// <div class="star-rating" style="--rating: ${frontmatter.note};"></div>\n`