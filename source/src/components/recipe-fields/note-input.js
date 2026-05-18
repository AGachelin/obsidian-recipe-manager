import { UI_CLASSES } from "../../shared/constants/ui.js";
import { RECIPE_LAYOUT } from "../../shared/constants/recipe-ui.js";
import { mountStarRating } from "../shared/star-rating.js";
import { InputConfig } from "../config/input-config.js";
import { ViewConfig } from "../config/view-config.js";

export class NoteInput extends InputConfig {
    constructor(path) {
        super("number", null);
        this.path = path;
        this.isGenerated = false;
    }

    generate(mb, view, value = null) {
        this.isGenerated = true;
        this.mb = mb;
        this.viewMode = view;
        this.value = value;

        if (view) {
            this.inputField = null;
            this.clampView = null;
            return;
        }

        const btNoteMem = mb.createBindTarget("memory", this.path, ["note"], true);

        const n = value != null && value !== "" ? Number(value) : 0;
        mb.setMetadata(btNoteMem, Number.isFinite(n) ? n : 0);
        const inputConfig = new InputConfig("number", btNoteMem, "inline", [
            { name: "defaultValue", value: [`${Number.isFinite(n) ? n : 0}`] },
        ]).render();
        this.inputField = mb.createInputFieldMountable(this.path, inputConfig);

        const viewDeclaration = "VIEW[clamp({memory^note}, 0, 5)][math(hidden):note]";
        this.clampViewConfig = new ViewConfig(viewDeclaration).render();
        this.clampView = mb.createViewFieldMountable(this.path, this.clampViewConfig);
    }

    /**
     * @returns {Array<{ parent: HTMLElement, field: unknown }>}
     */
    layoutMDRC(mb, container, view, value = null) {
        if (!this.isGenerated || this.viewMode !== view || this.value !== value) {
            this.generate(mb, view, value);
        }
        if (view) {
            const viewWrapper = container.createDiv({ cls: `${RECIPE_LAYOUT.viewField} note-view` });
            mountStarRating(viewWrapper, value);
            return [];
        }
        const inputWrapper = container.createDiv({ cls: `${RECIPE_LAYOUT.inputField} note-input` });
        return [
            { parent: inputWrapper, field: this.inputField },
            {
                parent: container,
                wrapperCls: UI_CLASSES.HIDDEN_VIEW_FIELD,
                field: this.clampView,
            },
        ];
    }
}
