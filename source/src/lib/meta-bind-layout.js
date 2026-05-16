/**
 * Helpers for `wrapInMDRC` layout pipelines ({@link recipe/renderer.js RecipeRenderer}, {@link frontpage/frontpage-renderer.js FrontpageRenderer}).
 */
import { UI_CLASSES } from "../shared/constants/ui.js";

/**
 * @typedef {object} MdrcLayoutStep
 * @property {HTMLElement} parent
 * @property {unknown} [field]
 * @property {string} [spanText]
 * @property {string} [wrapperCls] — if set, field mounts in a new `div` with this class (e.g. hidden sync views)
 */

/**
 * Meta Bind `wrapInMDRC` replaces the mount element — each field needs its own host.
 * @param {unknown} mb
 * @param {import("obsidian").Component} component
 * @param {MdrcLayoutStep[]} steps
 */
export function applyMdrcLayoutSteps(mb, component, steps) {
    for (const step of steps) {
        if (step.field != null) {
            const mountEl =
                step.wrapperCls != null
                    ? step.parent.createEl("div", { cls: step.wrapperCls })
                    : step.parent.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
            mb.wrapInMDRC(step.field, mountEl, component);
        }
        if (step.spanText != null) {
            step.parent.createEl("span", { text: step.spanText });
        }
    }
}

/**
 * @param {unknown} mb
 * @param {import("obsidian").Component} component
 * @param {unknown} field
 * @param {HTMLElement} parent
 */
export function wrapMdrcInDedicatedMount(mb, component, field, parent) {
    const mount = parent.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
    mb.wrapInMDRC(field, mount, component);
}
