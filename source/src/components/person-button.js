import { FRONTMATTER } from "../shared/constants/recipe.js";
import { InputConfig } from "./config/input-config.js";
import { ViewConfig } from "./config/view-config.js";

export class PersonButton {
    constructor(path, raw) {
        this.path = path;
        this.raw = raw;
        this.isGenerated = false;
    }

    generate(mb) {
        this.isGenerated = true;
        this.mb = mb;
        const btPersonCurrentStr = FRONTMATTER.PERSON.CURRENT;
        const btPersonCurrent = mb.parseBindTarget(btPersonCurrentStr, this.path);

        this.incButtonConfig = {
            label: "+1",
            hidden: true,
            id: "count-increment",
            style: "default",
            action: {
                type: "updateMetadata",
                bindTarget: btPersonCurrentStr,
                evaluate: true,
                value: "x + 1",
            },
        };
        this.decButtonConfig = {
            label: "-1",
            hidden: true,
            id: "count-decrement",
            style: "default",
            action: {
                type: "updateMetadata",
                bindTarget: btPersonCurrentStr,
                evaluate: true,
                value: "Math.max(0, x - 1)",
            },
        };
        this.resetButtonConfig = {
            label: "Reset",
            hidden: true,
            id: "count-reset",
            style: "default",
            action: {
                type: "updateMetadata",
                bindTarget: btPersonCurrentStr,
                evaluate: true,
                value: this.raw,
            },
        };
        this.incButtonOptions = {
            declaration: this.incButtonConfig,
            isPreview: false,
        };
        this.decButtonOptions = {
            declaration: this.decButtonConfig,
            isPreview: false,
        };
        this.resetButtonOptions = {
            declaration: this.resetButtonConfig,
            isPreview: false,
        };

        this.buttonGroupOptions = {
            declaration: { referencedButtonIds: ["count-decrement", "count-reset", "count-increment"] },
            renderChildType: "inline",
        };

        this.viewDeclaration = "VIEW[{person.current} personnes][text]";
        this.IncButton = mb.createButtonMountable(this.path, this.incButtonOptions);
        this.DecButton = mb.createButtonMountable(this.path, this.decButtonOptions);
        this.ResetButton = mb.createButtonMountable(this.path, this.resetButtonOptions);
        this.ButtonGroup = mb.createButtonGroupMountable(this.path, this.buttonGroupOptions);
        this.PersonView = mb.createViewFieldMountable(
            this.path,
            new ViewConfig("text", btPersonCurrent).render(this.viewDeclaration)
        );

        const personDefault = mb.getMetadata(btPersonCurrent);
        const personNum =
            personDefault != null && personDefault !== "" && Number.isFinite(Number(personDefault))
                ? Number(personDefault)
                : 1;
        const personInputConfig = new InputConfig("number", btPersonCurrent, "inline", [
            { name: "defaultValue", value: [`${personNum}`] },
        ]).render();
        this.personCountInput = mb.createInputFieldMountable(this.path, personInputConfig);
    }

    render(mb, viewMode) {
        if (!this.isGenerated) {
            this.generate(mb);
        }
        if (viewMode) {
            return [this.IncButton, this.DecButton, this.ResetButton, this.ButtonGroup, this.PersonView];
        }
        return [this.personCountInput, this.PersonView];
    }
}
