import { FRONTMATTER } from "../shared/constants/recipe.js";

/**
 * Flat frontmatter snapshot for RecipeRenderer.
 * @param {unknown} mb
 * @param {string} path
 */
function readRecipeMetadata(mb, path) {
    const parse = (key) => mb.parseBindTarget(key, path);
    const viewRaw = mb.getMetadata(parse(FRONTMATTER.VIEW));
    return {
        [FRONTMATTER.VIEW]: viewRaw,
        [FRONTMATTER.INGREDIENTS]: mb.getMetadata(parse(FRONTMATTER.INGREDIENTS)),
        [FRONTMATTER.PREP_DURATION]: mb.getMetadata(parse(FRONTMATTER.PREP_DURATION)),
        [FRONTMATTER.COOK_DURATION]: mb.getMetadata(parse(FRONTMATTER.COOK_DURATION)),
        [FRONTMATTER.REST_DURATION]: mb.getMetadata(parse(FRONTMATTER.REST_DURATION)),
        [FRONTMATTER.OVEN]: mb.getMetadata(parse(FRONTMATTER.OVEN)),
        [FRONTMATTER.NOTE]: mb.getMetadata(parse(FRONTMATTER.NOTE)),
        [FRONTMATTER.SOURCE]: mb.getMetadata(parse(FRONTMATTER.SOURCE)),
        [FRONTMATTER.TAGS]: mb.getMetadata(parse(FRONTMATTER.TAGS)),
    };
}

/**
 * Coalesces bursts of metadata updates (e.g. several buttons in one tick) into one refresh.
 * @param {unknown} mb
 * @param {import("obsidian").Component} component
 * @param {string} path
 * @param {() => void | Promise<void>} refresh
 */
function wireMetadataSubscriptions(mb, component, path, refresh) {
    const parse = (key) => mb.parseBindTarget(key, path);

    let coalescing = false;
    const schedule = () => {
        if (coalescing) return;
        coalescing = true;
        queueMicrotask(() => {
            coalescing = false;
            void refresh();
        });
    };

    const watch = (bindTarget) => {
        mb.subscribeToMetadata(bindTarget, component, schedule);
    };

    watch(parse(FRONTMATTER.VIEW));
    watch(parse(FRONTMATTER.INGREDIENTS));
    watch(mb.createBindTarget("frontmatter", path, [FRONTMATTER.PERSON.LABEL], true));
}

/**
 * Live recipe block for js-engine: mounts RecipeRenderer and subscribes only to
 * frontmatter keys that affect this UI (including nested `person` as one bind target).
 *
 * @param {*} engine
 * @param {{ file: { path: string } }} context
 * @param {HTMLElement} container
 * @param {import("obsidian").Component} component
 */
export async function setupRecipeLive(engine, context, container, component) {
    const mb = engine.getPlugin("obsidian-meta-bind-plugin").api;
    const path = context.file.path;
    const { RecipeRenderer } = await engine.importJs("source/src/lib/recipe-renderer.js");
    const renderer = new RecipeRenderer(path);

    function renderRecipe() {
        const meta = readRecipeMetadata(mb, path);
        const view = meta[FRONTMATTER.VIEW] === true || meta[FRONTMATTER.VIEW] === "true";
        renderer.render(mb, container, component, view, meta);
    }

    const reactive = engine.reactive(renderRecipe);

    wireMetadataSubscriptions(mb, component, path, () => reactive.refresh());

    return reactive;
}
