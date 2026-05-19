import { DurationInput } from "../shared/duration-input.js";
import { TagsInput } from "../shared/tags-input.js";
import { FrontpageFm, FRONTPAGE_DEFAULT_MAX_DURATION_SEC } from "../../shared/constants/frontpage.js";
import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";
import { getFrontpageLabels } from "../../shared/i18n/index.js";
import { mountCollapsibleSection } from "./collapsible-sections.js";
import { mountSliderField, mountTextField } from "./filter-field-mounts.js";
import { applyMdrcLayoutSteps, wrapMdrcInDedicatedMount } from "../../lib/render/mdrc-layout.js";

export class FrontpageRatingFilterSection {
    /**
     * @param {string} path
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     */
    constructor(path, lang) {
        this.path = path;
        this.lang = lang;
        this.L = getFrontpageLabels(lang);
    }

    mount(sidebarContent, mb, component) {
        const section = mountCollapsibleSection(sidebarContent, this.L.RATING_SECTION, false);
        mountSliderField(mb, component, section, this.path, FrontpageFm.FILTER_NOTE_MIN, this.L.MIN_RATING, {
            min: 0,
            max: 5,
            step: 0.1,
        });
        mountSliderField(mb, component, section, this.path, FrontpageFm.FILTER_NOTE_MAX, this.L.MAX_RATING, {
            min: 0,
            max: 5,
            step: 0.1,
        });
    }
}

export class FrontpageDurationFilterSection {
    /**
     * @param {string} path
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     */
    constructor(path, lang) {
        this.path = path;
        this.lang = lang;
        this.L = getFrontpageLabels(lang);
        const specs = [
            [FrontpageFm.FILTER_PREP_MAX_SEC, "MAX_PREP"],
            [FrontpageFm.FILTER_COOK_MAX_SEC, "MAX_COOK"],
            [FrontpageFm.FILTER_REST_MAX_SEC, "MAX_REST"],
            [FrontpageFm.FILTER_COOL_MAX_SEC, "MAX_COOL"],
            [FrontpageFm.FILTER_FREEZE_MAX_SEC, "MAX_FREEZE"],
        ];
        /** @type {{ input: DurationInput, labelKey: string }[]} */
        this.inputs = specs.map(([field, labelKey]) => ({
            input: new DurationInput(path, field),
            labelKey,
        }));
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
        for (const { input, labelKey } of this.inputs) {
            input.label = this.L[labelKey];
            input.generate(mb, false, readSec(input.durationField));
        }
    }

    mount(sidebarContent, mb, component) {
        const section = mountCollapsibleSection(
            sidebarContent,
            this.L.DURATIONS_SECTION,
            false,
            FRONTPAGE_LAYOUT.durationBlock
        );
        for (const { input, labelKey } of this.inputs) {
            input.label = this.L[labelKey];
            applyMdrcLayoutSteps(
                mb,
                component,
                input.layoutMDRC(
                    mb,
                    section,
                    false,
                    input.lastValue ?? FRONTPAGE_DEFAULT_MAX_DURATION_SEC
                )
            );
        }
    }
}

export class FrontpageTagsFilterSection {
    /**
     * @param {string} path
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     */
    constructor(path, lang) {
        this.path = path;
        this.lang = lang;
        this.L = getFrontpageLabels(lang);
        this.tagsInput = new TagsInput(path, FrontpageFm.FILTER_TAGS, false);
    }

    generate(mb) {
        this.tagsInput.generate(mb);
    }

    mount(sidebarContent, mb, component) {
        const secTags = mountCollapsibleSection(sidebarContent, this.L.TAGS_SECTION, false);
        secTags.createEl("p", {
            cls: FRONTPAGE_LAYOUT.hint,
            text: this.L.TAGS_HINT,
        });
        const tagsRow = secTags.createDiv({ cls: FRONTPAGE_LAYOUT.tagsContainer });
        this.tagsInput
            .render(mb)
            .forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, tagsRow));
    }
}

export class FrontpageSourceFilterSection {
    /**
     * @param {string} path
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     */
    constructor(path, lang) {
        this.path = path;
        this.lang = lang;
        this.L = getFrontpageLabels(lang);
    }

    mount(sidebarContent, mb, component) {
        const sec = mountCollapsibleSection(sidebarContent, this.L.SOURCE_SECTION, false);
        mountTextField(
            mb,
            component,
            sec,
            this.path,
            FrontpageFm.FILTER_SOURCE_SUBSTR,
            this.L.SOURCE_CONTAINS,
            this.L.SOURCE_PLACEHOLDER
        );
    }
}
