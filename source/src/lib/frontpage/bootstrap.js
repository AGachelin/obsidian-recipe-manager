/**
 * Entry for templates — mirrors {@link ../recipe-live.js}: dynamic import of renderer, single call.
 *
 * @param {*} engine
 * @param {{ file: import("obsidian").TFile }} context
 * @param {HTMLElement} container
 * @param {import("obsidian").Component} component
 */
import { resolveLanguage } from "../../shared/i18n/index.js";

export async function setupFrontpageLive(engine, context, container, component, lang) {
    const { FrontpageRenderer } = await engine.importJs("source/src/lib/frontpage/frontpage-renderer.js");
    const resolvedLang = resolveLanguage(lang, engine);
    return new FrontpageRenderer(context.file.path, resolvedLang).render(engine, context, container, component);
}
