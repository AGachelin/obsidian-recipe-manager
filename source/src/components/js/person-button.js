import { ViewConfig } from "./view-config";

export class PersonButton {
    constructor(path, target, raw) {
        this.path = path;
        this.target = target;
        this.raw = raw;
        this.incButtonConfig = {
			label: "+1",
			hidden: true,
			id: "count-increment",
			style: "default",
			action:{
			    type: "updateMetadata",
			    bindTarget: "person.current",
			    evaluate: true,
			    value: "x + 1"
			}
		};
		this.decButtonConfig = {
			label: "-1",
			hidden: true,
			id: "count-decrement",
			style: "default",
			action:{
			    type: "updateMetadata",
			    bindTarget: "person.current",
			    evaluate: true,
			    value: "Math.max(0, x - 1)"
			}
		};
		this.resetButtonConfig = {
			label: "Reset",
			hidden: true,
			id: "count-reset",
			style: "default",
			action:{
			    type: "updateMetadata",
			    bindTarget: "person.current",
			    evaluate: true,
			    value: this.raw
			}
		};
		this.incButtonOptions = {
		    declaration: this.incButtonConfig,
		    isPreview: false
		};
		this.decButtonOptions = {
		    declaration: this.decButtonConfig,
		    isPreview: false
		};
		this.resetButtonOptions = {
		    declaration: this.resetButtonConfig,
		    isPreview: false
		};

        this.buttonGroupOptions = {
            declaration: {referencedButtonIds:['count-decrement', 'count-reset','count-increment']},
            renderChildType:'inline'
		}

        this.viewDeclaration = "VIEW[{person.current} personnes][text]";
    }

    render(mb) {
		const IncButton = mb.createButtonMountable(context.file.path, this.incButtonOptions);
		const DecButton = mb.createButtonMountable(context.file.path, this.decButtonOptions);
		const ResetButton = mb.createButtonMountable(context.file.path, this.resetButtonOptions);
        const ButtonGroup = mb.createButtonGroupMountable(context.file.path, this.buttonGroupOptions);
        const PersonView = mb.createViewFieldMountable(context.file.path, new ViewConfig('text').render(this.viewDeclaration));
        return [IncButton, DecButton, ResetButton, ButtonGroup, PersonView];
    }
}
