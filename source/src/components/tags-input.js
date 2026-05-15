import { FRONTMATTER } from "../shared/constants/recipe.js";
import { InputConfig } from "./config/input-config.js";

export class TagsInput extends InputConfig {
    /**
     * @param {string} path Vault path of the note whose frontmatter is bound.
     * @param {string} [bindKey] Frontmatter key to read/write (default: recipe `tags`).
     * @param {boolean} [allowOther] Whether to allow other tags (default: true).
     */
    constructor(path, bindKey = FRONTMATTER.TAGS, allowOther = true) {
        super("inlineListSuggester", null);
        this.path = path;
        this.bindKey = bindKey;
        this.allowOther = allowOther;
        this.isGenerated = false;
    }

    generate(mb) {
        this.isGenerated = true;
        this.mb = mb;
        const btTags = mb.parseBindTarget(this.bindKey, this.path);
        this.bindTarget = btTags;
        this.declaration_arguments = Object.keys(mb.mb.app.metadataCache.getTags())
            .map((x) => ({
                name: "option",
                value: [x.toString()],
            }))
            .concat([{ name: "allowOther", value: [String(this.allowOther)] }]);
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
