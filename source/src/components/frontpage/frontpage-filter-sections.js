import { DurationInput } from "../shared/duration-input.js";
import { TagsInput } from "../shared/tags-input.js";
import { FrontpageFm, FRONTPAGE_DEFAULT_MAX_DURATION_SEC } from "../../shared/constants/frontpage.js";
import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";
import { mountCollapsibleSection } from "./collapsible-sections.js";
import { mountSliderField, mountTextField } from "./filter-field-mounts.js";
import { applyMdrcLayoutSteps, wrapMdrcInDedicatedMount } from "../../lib/render/mdrc-layout.js";

export class FrontpageRatingFilterSection {
    /**
     * @param {string} path
     */
    constructor(path) {
        this.path = path;
    }

    mount(sidebarContent, mb, component) {
        const section = mountCollapsibleSection(sidebarContent, "Rating", false);
        mountSliderField(mb, component, section, this.path, FrontpageFm.FILTER_NOTE_MIN, "Min rating", {
            min: 0,
            max: 5,
            step: 0.1,
        });
        mountSliderField(mb, component, section, this.path, FrontpageFm.FILTER_NOTE_MAX, "Max rating", {
            min: 0,
            max: 5,
            step: 0.1,
        });
    }
}

export class FrontpageDurationFilterSection {
    /**
     * @param {string} path
     */
    constructor(path) {
        this.path = path;
        const specs = [
            [FrontpageFm.FILTER_PREP_MAX_SEC, "Max preparation"],
            [FrontpageFm.FILTER_COOK_MAX_SEC, "Max cooking"],
            [FrontpageFm.FILTER_REST_MAX_SEC, "Max rest"],
            [FrontpageFm.FILTER_COOL_MAX_SEC, "Max cool"],
            [FrontpageFm.FILTER_FREEZE_MAX_SEC, "Max freeze"]
        ];
        /** @type {DurationInput[]} */
        this.inputs = specs.map(([field, label]) => {
            const d = new DurationInput(path, field);
            d.label = label;
            return d;
        });
    }

    /** @param {*} mb */
    generate(mb) {
        const path = this.path;
        const readSec = (fmKey) => {
            const bt = mb.parseBindTarget(fmKey, path);
            const v = mb.getMetadata(bt);
            const n = Number(v);
            return Number.isFinite(n) ? n : FRONTPAGE_DEFAULT_MAX_DURATION_SEC;
        };
        for (const input of this.inputs) {
            input.generate(mb, false, readSec(input.durationField));
        }
    }

    mount(sidebarContent, mb, component) {
        const section = mountCollapsibleSection(
            sidebarContent,
            "Durations",
            false,
            FRONTPAGE_LAYOUT.durationBlock
        );
        for (const durInput of this.inputs) {
            applyMdrcLayoutSteps(
                mb,
                component,
                durInput.layoutMDRC(
                    mb,
                    section,
                    false,
                    durInput.lastValue ?? FRONTPAGE_DEFAULT_MAX_DURATION_SEC
                )
            );
        }
    }
}

export class FrontpageTagsFilterSection {
    /**
     * @param {string} path
     */
    constructor(path) {
        this.path = path;
        this.tagsInput = new TagsInput(path, FrontpageFm.FILTER_TAGS, false);
    }

    generate(mb) {
        this.tagsInput.generate(mb);
    }

    mount(sidebarContent, mb, component) {
        const secTags = mountCollapsibleSection(sidebarContent, "Tags", false);
        secTags.createEl("p", {
            cls: FRONTPAGE_LAYOUT.hint,
            text: "Recipes must include every tag you pick here (empty = no tag filter).",
        });
        const tagsRow = secTags.createEl("div", { cls: FRONTPAGE_LAYOUT.tagsContainer });
        this.tagsInput
            .render(mb)
            .forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, tagsRow));
    }
}

export class FrontpageSourceFilterSection {
    /** @param {string} path */
    constructor(path) {
        this.path = path;
    }

    mount(sidebarContent, mb, component) {
        const sec = mountCollapsibleSection(sidebarContent, "Source", false);
        mountTextField(
            mb,
            component,
            sec,
            this.path,
            FrontpageFm.FILTER_SOURCE_SUBSTR,
            "Contains",
            "source contains…"
        );
    }
}
