/**
 * Meta Bind `wrapInMDRC` layout helpers ({@link ./meta-bind-page-renderer.js}).
 */
import { UI_CLASSES } from "../../shared/constants/ui.js";

/**
 * @typedef {object} MdrcLayoutStep
 * @property {HTMLElement} parent
 * @property {unknown} [field]
 * @property {string} [spanText]
 * @property {string} [wrapperCls]
 */

/**
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
