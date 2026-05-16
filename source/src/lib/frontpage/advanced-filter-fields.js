import { InputConfig } from "../../components/config/input-config.js";
import { FRONTPAGE_DEFAULT_MAX_DURATION_SEC } from "../../shared/constants/frontpage.js";
import { UI_CLASSES } from "../../shared/constants/ui.js";

/**
 * @param {*} mb
 * @param {import("obsidian").Component} component
 * @param {HTMLElement} parent
 * @param {string} path
 * @param {string} key
 * @param {string} label
 * @param {{ min: number; max: number; step: number }} spec
 */
export function mountSliderField(mb, component, parent, path, key, label, spec) {
    const bt = mb.parseBindTarget(key, path);
    const cur = Number(mb.getMetadata(bt));
    const fallback = key.includes("max") ? spec.max : spec.min;
    const def = Number.isFinite(cur) ? cur : fallback;
    const config = new InputConfig("slider", bt, "inline", [
        { name: "defaultValue", value: [String(def)] },
        { name: "minValue", value: [String(spec.min)] },
        { name: "maxValue", value: [String(spec.max)] },
        { name: "stepSize", value: [String(spec.step)] },
    ]).render();
    const wrap = parent.createEl("div", { cls: "frontpage-live__field" });
    wrap.createEl("label", { cls: "frontpage-live__label", text: label });
    const mount = wrap.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
    const field = mb.createInputFieldMountable(path, config);
    mb.wrapInMDRC(field, mount, component);
}

/**
 * @param {*} mb
 * @param {import("obsidian").Component} component
 * @param {HTMLElement} parent
 * @param {string} path
 * @param {string} key
 * @param {string} label
 * @param {string} [placeholder]
 */
export function mountTextField(mb, component, parent, path, key, label, placeholder) {
    const bt = mb.parseBindTarget(key, path);
    const args = [];
    if (placeholder) {
        args.push({ name: "placeholder", value: [placeholder] });
    }
    const config = new InputConfig("text", bt, "inline", args).render();
    const wrap = parent.createEl("div", { cls: "frontpage-live__field" });
    wrap.createEl("label", { cls: "frontpage-live__label", text: label });
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

    set("filter_note_min", 0);
    set("filter_note_max", 5);
    set("filter_prep_max_sec", maxDur);
    set("filter_cook_max_sec", maxDur);
    set("filter_rest_max_sec", maxDur);
    set("filter_source_substr", "");
    set("filter_tags", []);
    set("filter_ingredients_state", {});
    set("filter_ingredients_amount", {});
    set("filter_ingredients_unit", {});
}
