import { InputConfig } from "../../components/config/input-config.js";
import { FrontpageFm, FRONTPAGE_DEFAULT_MAX_DURATION_SEC } from "../../shared/constants/frontpage.js";
import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";
import { UI_CLASSES } from "../../shared/constants/ui.js";

/**
 * @param {*} mb
 * @param {import("obsidian").Component} component
 * @param {HTMLElement} parent
 * @param {string} path
 * @param {string} fmKey One of {@link FrontpageFm} string values
 * @param {string} label
 * @param {{ min: number; max: number; step: number }} spec
 */
export function mountSliderField(mb, component, parent, path, fmKey, label, spec) {
    const bt = mb.parseBindTarget(fmKey, path);
    const cur = Number(mb.getMetadata(bt));
    const fallback = fmKey.includes("max") ? spec.max : spec.min;
    const def = Number.isFinite(cur) ? cur : fallback;
    const config = new InputConfig("slider", bt, "inline", [
        { name: "defaultValue", value: [String(def)] },
        { name: "minValue", value: [String(spec.min)] },
        { name: "maxValue", value: [String(spec.max)] },
        { name: "stepSize", value: [String(spec.step)] },
    ]).render();
    const wrap = parent.createEl("div", { cls: FRONTPAGE_LAYOUT.field });
    wrap.createEl("label", { cls: FRONTPAGE_LAYOUT.label, text: label });
    const mount = wrap.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
    const field = mb.createInputFieldMountable(path, config);
    mb.wrapInMDRC(field, mount, component);
}

/**
 * @param {*} mb
 * @param {import("obsidian").Component} component
 * @param {HTMLElement} parent
 * @param {string} path
 * @param {string} fmKey
 * @param {string} label
 * @param {string} [placeholder]
 */
export function mountTextField(mb, component, parent, path, fmKey, label, placeholder) {
    const bt = mb.parseBindTarget(fmKey, path);
    const args = [];
    if (placeholder) {
        args.push({ name: "placeholder", value: [placeholder] });
    }
    const config = new InputConfig("text", bt, "inline", args).render();
    const wrap = parent.createEl("div", { cls: FRONTPAGE_LAYOUT.field });
    wrap.createEl("label", { cls: FRONTPAGE_LAYOUT.label, text: label });
    const mount = wrap.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
    const field = mb.createInputFieldMountable(path, config);
    mb.wrapInMDRC(field, mount, component);
}

/**
 * @param {*} mb
 * @param {string} path
 */
export function resetAdvancedFilterMetadata(mb, path) {
    const at = (k) => mb.parseBindTarget(k, path);
    const set = (k, v) => mb.setMetadata(at(k), v);
    const maxDur = FRONTPAGE_DEFAULT_MAX_DURATION_SEC;

    set(FrontpageFm.FILTER_NOTE_MIN, 0);
    set(FrontpageFm.FILTER_NOTE_MAX, 5);
    set(FrontpageFm.FILTER_PREP_MAX_SEC, maxDur);
    set(FrontpageFm.FILTER_COOK_MAX_SEC, maxDur);
    set(FrontpageFm.FILTER_REST_MAX_SEC, maxDur);
    set(FrontpageFm.FILTER_SOURCE_SUBSTR, "");
    set(FrontpageFm.FILTER_TAGS, []);
    set(FrontpageFm.FILTER_INGREDIENTS_STATE, {});
    set(FrontpageFm.FILTER_INGREDIENTS_AMOUNT, {});
    set(FrontpageFm.FILTER_INGREDIENTS_UNIT, {});
}
