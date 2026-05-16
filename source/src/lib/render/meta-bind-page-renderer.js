/**
 * Shared footing for wiki pages rendered through Meta Bind + js-engine ({@link RecipeRenderer}, {@link FrontpageRenderer}).
 * Keep common wiring here; layout stays in subclasses.
 */
export class MetaBindPageRenderer {
    /**
     * Vault path for the Markdown note owning this Meta Bind widget tree (`context.file.path`).
     * @param {string} path
     */
    constructor(path) {
        this.path = path;
    }

    /**
     * @param {*} engine
     * @returns {*}
     */
    static metaBind(engine) {
        return engine.getPlugin("obsidian-meta-bind-plugin").api;
    }
}
