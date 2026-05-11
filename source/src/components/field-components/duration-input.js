import {FRONTMATTER_LABELS, FRONTMATTER_DEFAULTS} from "../../shared/constants/recipe.js";
import {UI_CLASSES} from "../../shared/constants/ui.js";
import {InputConfig} from "../config/input-config.js";
import {ViewConfig} from "../config/view-config.js";

class DurationSelect extends InputConfig {
    constructor(max) {
        super('inlineSelect', null, 'inline');
        this.defaultValue = FRONTMATTER_DEFAULTS.DURATION;
        this.options = this.createSelectOptions(max);
        this.max = max;
    }

    setBindTarget(bindTarget) {
        this.bindTarget = bindTarget;
    }

    render(value) {
        if (typeof value === "number") {
            this.defaultValue = value;
        } else if (value != null && value !== "") {
            const n = Number(value);
            this.defaultValue = Number.isFinite(n) ? n : this.defaultValue;
        }
        this.declaration_arguments = this.options.concat(
            [{name: "defaultValue", value: [`${this.defaultValue}`]}]
        );
        return super.render();
    }

    createSelectOptions(max) {
        return [...Array(max).keys()].map((i) => {return {'name': 'option', 'value': [`${i}`]}});
    }
}

export class DurationInput {
    constructor(path, durationField) {
        this.path = path;
        this.durationField = durationField;
        this.label = FRONTMATTER_LABELS.COOK;
        this.hourSelect = new DurationSelect(24);
        this.minuteSelect = new DurationSelect(60);
        this.secondSelect = new DurationSelect(60);
        this.isGenerated = false;
        this.lastView = null;
        this.lastValue = null;
    }

    generate(mb, view, value=null) {
        this.isGenerated = true;
        this.lastView = view;
        this.lastValue = value;
        
        const btHour = mb.createBindTarget('memory', this.path, [this.durationField, 'hour'], true);
        const btMinute = mb.createBindTarget('memory', this.path, [this.durationField, 'minute'], true);
        const btSecond = mb.createBindTarget('memory', this.path, [this.durationField, 'second'], true);
        const btTotal = mb.parseBindTarget(this.durationField, this.path);
        
        this.hourSelect.setBindTarget(btHour);
        this.minuteSelect.setBindTarget(btMinute);
        this.secondSelect.setBindTarget(btSecond);
        
        this.editView = `VIEW[number({memory^${this.durationField}["hour"]} h, s)+number({memory^${this.durationField}["minute"]} minute, s)+number({memory^${this.durationField}["second"]} s, s)][math(hidden):${this.durationField}]`;
        this.editViewConfig = new ViewConfig("math", btTotal);
        this.view = `VIEW[splitTime({${this.durationField}}, false)]`;
        this.viewConfig = new ViewConfig("splitTime", btTotal);
        
        if(!view){
            const hourValue = Math.floor(value / 3600);
            mb.setMetadata(btHour, hourValue);
            const minuteValue = Math.floor((value % 3600) / 60);
            mb.setMetadata(btMinute, minuteValue);
            const secondValue = value % 60;
            mb.setMetadata(btSecond, secondValue);
            this.hourSelectConfig = this.hourSelect.render(hourValue);
            this.minuteSelectConfig = this.minuteSelect.render(minuteValue);
            this.secondSelectConfig = this.secondSelect.render(secondValue);
            this.editViewConfig_ = this.editViewConfig.render(this.editView);

            this.hourSelectField = mb.createInputFieldMountable(this.path, this.hourSelectConfig);
            this.minuteSelectField = mb.createInputFieldMountable(this.path, this.minuteSelectConfig);
            this.secondSelectField = mb.createInputFieldMountable(this.path, this.secondSelectConfig);
            this.editViewField = mb.createViewFieldMountable(this.path, this.editViewConfig_);
        } else {
            this.viewConfig_ = this.viewConfig.render(this.view);
            this.viewField = mb.createViewFieldMountable(this.path, this.viewConfig_);
        }
    }

    render(mb, container, component, view, value=null) {
        if (!this.isGenerated || this.lastView !== view || this.lastValue !== value) {
            this.generate(mb, view, value ?? this.lastValue);
        }

        this.container = container;
        this.component = component;

        if (!view) {        
            const containerDiv = this.container.createEl('div', { cls: UI_CLASSES.DURATION_INPUT_GROUP });
            containerDiv.createEl('label', { text: this.label + ': ' });
            const inputContainer = containerDiv.createEl('div', { cls: UI_CLASSES.DURATION_INPUTS });
            mb.wrapInMDRC(this.hourSelectField, inputContainer, this.component);
            inputContainer.createEl('span', { text: 'h ' });
            mb.wrapInMDRC(this.minuteSelectField, inputContainer, this.component);
            inputContainer.createEl('span', { text: 'min ' });
            mb.wrapInMDRC(this.secondSelectField, inputContainer, this.component);
            inputContainer.createEl('span', { text: 's' });
            mb.wrapInMDRC(this.editViewField, containerDiv, this.component);
        } else {
            const viewContainer = this.container.createEl('div', { cls: UI_CLASSES.DURATION_VIEW_GROUP });
            viewContainer.createEl('strong', { text: this.label + ': ' });
            mb.wrapInMDRC(this.viewField, viewContainer, this.component);
        }
    }
}
