import { InputConfig } from "./input-config";
import { ViewConfig } from "./view-config";

export class NoteInput extends InputConfig {
    constructor(target, path) {
        super('number', target);
        this.path = path;
        this.viewDeclaration = "VIEW[clamp({memory^note}, 0, 5)][math(hidden):note]";
        this.clampViewConfig = new ViewConfig('math', this.target).render(this.viewDeclaration);
    }
    render(mb, view, value=null) {
        if(view) {
            this.viewConfig = new ViewConfig('math', this.target).render("View[{note}]");
            this.view = mb.createViewFieldMountable(this.path, this.viewConfig);
            return [this.view];
        }
        this.defaultValue = value !== null ? [`${value}`] : [];
        this.declaration_arguments = [{ name: 'defaultValue', value: this.defaultValue }];
        this.config = super.render();
        this.inputField = mb.createInputFieldMountable(this.path, this.config);
        this.clampView = mb.createViewFieldMountable(this.path, this.clampViewConfig);
        return [this.inputField, this.clampView];
    }
}