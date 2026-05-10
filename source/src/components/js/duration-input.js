import {FRONTMATTER_LABELS, FRONTMATTER_DEFAULTS} from "../../shared/constants/recipe.js";
import {InputConfig} from "./input-config.js";
import {ViewConfig} from "./view-config.js";

class DurationSelect extends InputConfig {
    constructor(bindTarget, max) {
        super('inlineSelect', bindTarget, 'inline');
        this.defaultValue = FRONTMATTER_DEFAULTS.DURATION;
        this.options = this.createSelectOptions(max);
        this.max = max;
    }

    render(value) {
        this.defaultValue = value || this.defaultValue;
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
    constructor(path, bindTargetHour, bindTargetMinute, bindTargetSecond, bindTarget, target) {
        this.path = path;
        this.target = target;
        this.editView = `VIEW[number({memory^${target}["hour"]} h, s)+number({memory^${target}["min"]} minute, s)+number({memory^${target}["sec"]} s, s)][math(hidden):${target}]`;
        this.editViewConfig = new ViewConfig("toggle", bindTarget);
        this.view = `VIEW[splitTime({${target}}, false)]`;
        this.viewConfig = new ViewConfig("splitTime", bindTarget);
        this.hourSelect = new DurationSelect(bindTargetHour, 24);
        this.minuteSelect = new DurationSelect(bindTargetMinute, 60);
        this.secondSelect = new DurationSelect(bindTargetSecond, 60);
    }

    render(mb, view, value=null) {
        if(view){
            const hourValue = Math.floor(value / 3600);
            mb.setMetadata(this.hourSelect.bindTarget, hourValue);
            const minuteValue = Math.floor((value % 3600) / 60);
            mb.setMetadata(this.minuteSelect.bindTarget, minuteValue);
            const secondValue = value % 60;
            mb.setMetadata(this.secondSelect.bindTarget, secondValue);
            this.hourSelectConfig = this.hourSelect.render(hourValue);
            this.minuteSelectConfig = this.minuteSelect.render(minuteValue);
            this.secondSelectConfig = this.secondSelect.render(secondValue);
            this.editViewConfig_ = this.editViewConfig.render(this.editView);

            this.hourSelectField = mb.createInputFieldMountable(this.path, this.hourSelectConfig);
            this.minuteSelectField = mb.createInputFieldMountable(this.path, this.minuteSelectConfig);
            this.secondSelectField = mb.createInputFieldMountable(this.path, this.secondSelectConfig);
            this.editViewField = mb.createViewFieldMountable(this.path, this.editViewConfig_);
            return [this.hourSelectField, this.minuteSelectField, this.secondSelectField, this.editViewField];

        } else {
            this.viewConfig_ = this.viewConfig.render(this.view);
            this.viewField = mb.createViewFieldMountable(this.path, this.viewConfig_);
            return [this.viewField];
        }
    }
}
