import { InputConfig } from "./config/input-config.js";
import { ViewConfig } from "./config/view-config.js";

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

        const btNote = mb.parseBindTarget("note", this.path);
        this.bindTarget = btNote;
        const btNoteMem = mb.createBindTarget("memory", this.path, ["note"], true);

        if (view) {
            this.viewConfig = new ViewConfig("math", btNote).render("VIEW[{note}]");
            this.view = mb.createViewFieldMountable(this.path, this.viewConfig);
            this.inputField = null;
            this.clampView = null;
        } else {
            const n = value != null && value !== "" ? Number(value) : 0;
            mb.setMetadata(btNoteMem, Number.isFinite(n) ? n : 0);
            const inputConfig = new InputConfig("number", btNoteMem, "inline", [
                { name: "defaultValue", value: [`${Number.isFinite(n) ? n : 0}`] },
            ]).render();
            this.inputField = mb.createInputFieldMountable(this.path, inputConfig);

            const viewDeclaration = "VIEW[clamp({memory^note}, 0, 5)][math(hidden):note]";
            this.clampViewConfig = new ViewConfig("math", btNote).render(viewDeclaration);
            this.clampView = mb.createViewFieldMountable(this.path, this.clampViewConfig);
            this.view = null;
        }
    }

    render(mb, view, value = null) {
        if (!this.isGenerated || this.viewMode !== view || this.value !== value) {
            this.generate(mb, view, value);
        }
        if (view) {
            return [this.view];
        }
        return [this.inputField, this.clampView];
    }
}
