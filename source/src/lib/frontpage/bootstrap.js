/**
 * Entry for templates — mirrors {@link ../recipe-live.js}: dynamic import of renderer, single call.
 *
 * @param {*} engine
 * @param {{ file: import("obsidian").TFile }} context
 * @param {HTMLElement} container
 * @param {import("obsidian").Component} component
 */
export async function setupFrontpageLive(engine, context, container, component) {
    const { FrontpageRenderer } = await engine.importJs("source/src/lib/frontpage/frontpage-renderer.js");
    return new FrontpageRenderer(context.file.path).mount(engine, context, container, component);
}
