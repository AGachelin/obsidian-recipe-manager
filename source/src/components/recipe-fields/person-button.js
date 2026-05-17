import { FRONTMATTER } from "../../shared/constants/recipe.js";
import { InputConfig } from "../config/input-config.js";
import { ViewConfig } from "../config/view-config.js";
import { ButtonConfig } from "../config/button-config.js";
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

        this.incButtonConfig = new ButtonConfig("count-increment", "+1");
        this.incButtonConfig.addUpdateMetadataAction(btPersonCurrentStr, "x + 1");
        this.decButtonConfig = new ButtonConfig("count-decrement", "-1");
        this.decButtonConfig.addUpdateMetadataAction(btPersonCurrentStr, "Math.max(0, x - 1)");
        this.resetButtonConfig = new ButtonConfig("count-reset", "Reset");
        this.resetButtonConfig.addUpdateMetadataAction(btPersonCurrentStr, this.raw);

        this.incButtonOptions = this.incButtonConfig.render();
        this.decButtonOptions = this.decButtonConfig.render();
        this.resetButtonOptions = this.resetButtonConfig.render();

        this.buttonGroupOptions = {
            declaration: { referencedButtonIds: [this.incButtonConfig.getId(), this.resetButtonConfig.getId(), this.decButtonConfig.getId()] },
            renderChildType: "inline",
        };

        this.IncButton = mb.createButtonMountable(this.path, this.incButtonOptions);
        this.DecButton = mb.createButtonMountable(this.path, this.decButtonOptions);
        this.ResetButton = mb.createButtonMountable(this.path, this.resetButtonOptions);
        this.ButtonGroup = mb.createButtonGroupMountable(this.path, this.buttonGroupOptions);
        this.PersonView = mb.createViewFieldMountable(
            this.path,
            new ViewConfig("VIEW[{person.current} personnes][text]").render()
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
