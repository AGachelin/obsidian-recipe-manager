import { InputConfig } from "./input-config.js";
import { ViewConfig } from "./view-config.js";

export class OvenInput extends InputConfig {
    constructor(target, path) {
        super('number', target);
        this.generated = false;
        this.path = path;
        this.viewDeclaration = "VIEW[bind({memory^oven}, 0, null)][math(hidden):oven]";
        this.bindViewConfig = new ViewConfig('math', this.target).render(this.viewDeclaration);
    }
    generate(mb, view, value=null) {
        this.generated = true;
        this.viewConfig = new ViewConfig('math', this.target).render("View[{oven}]");
        this.view = mb.createViewFieldMountable(this.path, this.viewConfig);
        this.defaultValue = value !== null ? [`${value}`] : [];
        this.declaration_arguments = [{name:"placeholder", value: "Enter oven temperature"}, { name: 'defaultValue', value: this.defaultValue }];
        this.config = super.render();
        this.inputField = mb.createInputFieldMountable(this.path, this.config);
        this.bindView = mb.createViewFieldMountable(this.path, this.bindViewConfig);
        return [this.inputField, this.bindView];
    }
    render(mb, container, component, view, value=null) {
        if (!this.generated || this.value !== value) {
            this.generate(mb, view, value);
        }
        this.component?.unload();
        this.container?.empty();
        this.container = container;
        this.component = component;
        this.value = value;
        this.component.unload();
        this.component.load();
        this.container.empty();
        if (!view) {
            const inputWrapper = this.container.createEl('div', { cls: 'input-field oven-input' });
            inputWrapper.createEl('label', { text: 'Oven Temperature: ' });
            mb.wrapInMDRC(this.inputField, inputWrapper, this.component);
            mb.wrapInMDRC(this.bindView, inputWrapper, this.component);
        } else {
            const viewWrapper = this.container.createEl('div', { cls: 'view-field oven-view' });
            viewWrapper.createEl('label', { text: 'Oven: ' });
            mb.wrapInMDRC(this.bindView, viewWrapper, this.component);
            viewWrapper.createEl('span', { text: ' °C' });
        }

    }
}