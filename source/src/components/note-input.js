import { InputConfig } from "./config/input-config.js";
import { ViewConfig } from "./config/view-config.js";

export class NoteInput extends InputConfig {
    constructor(path) {
        super('number', null);
        this.path = path;
        this.isGenerated = false;
    }

    generate(mb, view, value=null) {
        this.isGenerated = true;
        this.mb = mb;
        this.viewMode = view;
        this.value = value;
        
        const btNote = mb.parseBindTarget('note', this.path);
        this.bindTarget = btNote;
        
        if(view) {
            this.viewConfig = new ViewConfig('math', btNote).render("VIEW[{note}]");
            this.view = mb.createViewFieldMountable(this.path, this.viewConfig);
        } else {
            if(value!==null){
                this.defaultValue = [`${value}`];
                this.declaration_arguments = [{ name: 'defaultValue', value: this.defaultValue }];
            }
            this.config = super.render();
            this.inputField = mb.createInputFieldMountable(this.path, this.config);
            
            const viewDeclaration = "VIEW[clamp({memory^note}, 0, 5)][math(hidden):note]";
            this.clampViewConfig = new ViewConfig('math', btNote).render(viewDeclaration);
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