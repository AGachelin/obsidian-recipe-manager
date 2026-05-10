import { InputConfig } from "./input-config";
import { ViewConfig } from "./view-config";

export class OvenInput extends InputConfig {
    constructor(target, path) {
        super('number', target);
        this.path = path;
        this.viewDeclaration = "VIEW[bind({memory^oven}, 0, null)][math(hidden):oven]";
        this.bindViewConfig = new ViewConfig('math', this.target).render(this.viewDeclaration);
    }
    render(mb, view, value=null) {
        if(view) {
            this.viewConfig = new ViewConfig('math', this.target).render("View[{oven}]");
            this.view = mb.createViewFieldMountable(this.path, this.viewConfig);
            return [this.view];
        }
        this.defaultValue = value !== null ? [`${value}`] : [];
        this.declaration_arguments = [{name:"placeholder", value: "Enter oven temperature"}, { name: 'defaultValue', value: this.defaultValue }];
        this.config = super.render();
        this.inputField = mb.createInputFieldMountable(this.path, this.config);
        this.bindView = mb.createViewFieldMountable(this.path, this.bindViewConfig);
        return [this.inputField, this.bindView];
    }
}