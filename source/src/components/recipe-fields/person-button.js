import { FRONTMATTER } from "../../shared/constants/recipe.js";
import {
    PERSON_CURRENT_MEMORY_BIND,
    createPersonCurrentMemoryBind,
    resetPersonCurrentFromRaw,
} from "../../lib/recipe/person-memory.js";
import { InputConfig } from "../config/input-config.js";
import { ViewConfig } from "../config/view-config.js";
import { ButtonConfig } from "../config/button-config.js";

export class PersonButton {
    constructor(path) {
        this.path = path;
        this.isGenerated = false;
        /** @type {boolean | null} */
        this._wasViewMode = null;
    }

    /**
     * @param {*} mb
     * @param {boolean} viewMode
     */
    generate(mb, viewMode) {
        const enteringView = viewMode && this._wasViewMode !== true;
        this._wasViewMode = viewMode;
        this.isGenerated = true;
        this.mb = mb;
        this.viewMode = viewMode;

        this.btPersonCurrentMem = createPersonCurrentMemoryBind(mb, this.path);
        if (enteringView) {
            resetPersonCurrentFromRaw(mb, this.path);
        }

        this.incButtonConfig = new ButtonConfig("count-increment", "+1");
        this.incButtonConfig.addUpdateMetadataAction(PERSON_CURRENT_MEMORY_BIND, "x + 1");
        this.decButtonConfig = new ButtonConfig("count-decrement", "-1");
        this.decButtonConfig.addUpdateMetadataAction(PERSON_CURRENT_MEMORY_BIND, "Math.max(0, x - 1)");
        this.resetButtonConfig = new ButtonConfig("count-reset", "Reset");
        this.resetButtonConfig.addUpdateMetadataAction(PERSON_CURRENT_MEMORY_BIND, "{person.raw}");

        this.incButtonOptions = this.incButtonConfig.render();
        this.decButtonOptions = this.decButtonConfig.render();
        this.resetButtonOptions = this.resetButtonConfig.render();

        this.buttonGroupOptions = {
            declaration: {
                referencedButtonIds: [
                    this.incButtonConfig.getId(),
                    this.resetButtonConfig.getId(),
                    this.decButtonConfig.getId(),
                ],
            },
            renderChildType: "inline",
        };

        this.IncButton = mb.createButtonMountable(this.path, this.incButtonOptions);
        this.DecButton = mb.createButtonMountable(this.path, this.decButtonOptions);
        this.ResetButton = mb.createButtonMountable(this.path, this.resetButtonOptions);
        this.ButtonGroup = mb.createButtonGroupMountable(this.path, this.buttonGroupOptions);

        const personViewExpr = viewMode
            ? `VIEW[{${PERSON_CURRENT_MEMORY_BIND}} personnes][text]`
            : `VIEW[{${FRONTMATTER.PERSON.RAW}} personnes][text]`;
        this.PersonView = mb.createViewFieldMountable(
            this.path,
            new ViewConfig(personViewExpr).render()
        );

        const btPersonRaw = mb.parseBindTarget(FRONTMATTER.PERSON.RAW, this.path);
        const rawDefault = mb.getMetadata(btPersonRaw);
        const rawNum =
            rawDefault != null && rawDefault !== "" && Number.isFinite(Number(rawDefault))
                ? Number(rawDefault)
                : 4;
        const personInputConfig = new InputConfig("number", btPersonRaw, "inline", [
            { name: "defaultValue", value: [`${rawNum}`] },
        ]).render();
        this.personCountInput = mb.createInputFieldMountable(this.path, personInputConfig);
    }

    /**
     * @param {*} mb
     * @param {boolean} viewMode
     */
    render(mb, viewMode) {
        if (!this.isGenerated || this.viewMode !== viewMode) {
            this.generate(mb, viewMode);
        }
        if (viewMode) {
            return [this.IncButton, this.DecButton, this.ResetButton, this.PersonView, this.ButtonGroup];
        }
        return [this.personCountInput, this.PersonView];
    }
}
