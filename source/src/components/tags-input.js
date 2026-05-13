import { InputConfig } from "./config/input-config.js";

export class TagsInput extends InputConfig {
    constructor(path) {
        super("inlineListSuggester", null);
        this.path = path;
        this.isGenerated = false;
    }

    generate(mb) {
        this.isGenerated = true;
        this.mb = mb;
        const btTags = mb.parseBindTarget("tags", this.path);
        this.bindTarget = btTags;
        this.declaration_arguments = Object.keys(mb.mb.app.metadataCache.getTags())
            .map((x) => ({
                name: "option",
                value: [x.toString()],
            }))
            .concat([{ name: "allowOther", value: ["true"] }]);
        this.config = super.render();
        this.inputField = mb.createInputFieldMountable(this.path, this.config);
    }

    render(mb) {
        if (!this.isGenerated) {
            this.generate(mb);
        }
        return [this.inputField];
    }

    update(mb) {
        mb.updateMetadata(this.bindTarget, (array) => [
            ...new Set(array.map((val) => (val[0] === "#" ? val : `#${val}`))),
        ]);
    }
}
