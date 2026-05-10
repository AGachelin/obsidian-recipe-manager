import { InputConfig } from "./input-config.js";
import { ViewConfig } from "./view-config.js";

export class SourceInput extends InputConfig {
    constructor(target, path) {
        super('text', target);
        this.path = path;
    }
    generate(mb, view, value=null) {
        this.viewConfig = new ViewConfig('text', this.target).render("View[{source}][text(renderMarkdown)]");
        this.view = mb.createViewFieldMountable(this.path, this.viewConfig);
        this.defaultValue = value !== null ? [`${value}`] : [];
        this.declaration_arguments = [{name:"placeholder", value: "Enter source"}, { name: 'defaultValue', value: this.defaultValue }];
        this.config = super.render();
        this.inputField = mb.createInputFieldMountable(this.path, this.config);
    }

    render(view, container, mb, comp){
        comp.unload();
        comp.load();
        container.empty();
        if (!view) {
            const inputWrapper = container.createEl('div', { cls: 'input-field source-input' });
            inputWrapper.createEl('label', { text: 'Source: ' });
            mb.wrapInMDRC(this.inputField, inputWrapper, comp);
        } else {
            const viewWrapper = container.createEl('div', { cls: 'view-field source-view' });
            viewWrapper.createEl('strong', { text: 'Source: ' });
            mb.wrapInMDRC(this.view, viewWrapper, comp);
        }
    }
}