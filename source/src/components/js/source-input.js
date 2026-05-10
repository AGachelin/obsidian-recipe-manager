import { InputConfig } from "./input-config";
import { ViewConfig } from "./view-config";

export class SourceInput extends InputConfig {
    constructor(target, path) {
        super('text', target);
        this.path = path;
    }
    render(mb, view, value=null) {
        if(view) {
            this.viewConfig = new ViewConfig('text', this.target).render("View[{source}][text(renderMarkdown)]");
            this.view = mb.createViewFieldMountable(this.path, this.viewConfig);
            return [this.view];
        }
        this.defaultValue = value !== null ? [`${value}`] : [];
        this.declaration_arguments = [{name:"placeholder", value: "Enter source"}, { name: 'defaultValue', value: this.defaultValue }];
        this.config = super.render();
        this.inputField = mb.createInputFieldMountable(this.path, this.config);
        return [this.inputField];
    }
}