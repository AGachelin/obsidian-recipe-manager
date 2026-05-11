import { InputConfig } from "./config/input-config.js";
import { ViewConfig } from "./config/view-config.js";

export class OvenInput extends InputConfig {
    constructor(path) {
        super('number', null);
        this.generated = false;
        this.path = path;
    }

    generate(mb, view, value=null) {
        this.generated = true;
        const btOven = mb.parseBindTarget('oven', this.path);
        this.bindTarget = btOven;
        this.viewConfig = new ViewConfig('math', btOven).render("VIEW[{oven}]");
        this.view = mb.createViewFieldMountable(this.path, this.viewConfig);
        this.declaration_arguments = [{name:"placeholder", value: ["Enter oven temperature"]}];

        if(value!==null){
            this.defaultValue = [`${value}`];
            this.declaration_arguments.push({ name: 'defaultValue', value: this.defaultValue });
        }

        this.config = super.render();
        this.inputField = mb.createInputFieldMountable(this.path, this.config);
        
        const viewDeclaration = "VIEW[bind({memory^oven}, 0, null)][math(hidden):oven]";
        this.bindViewConfig = new ViewConfig('math', btOven).render(viewDeclaration);
        this.bindView = mb.createViewFieldMountable(this.path, this.bindViewConfig);
        return [this.inputField, this.bindView];
    }
    render(mb, container, component, view, value=null) {
        if (!this.generated || this.value !== value) {
            this.generate(mb, view, value);
        }
        this.container = container;
        this.component = component;
        this.value = value;

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