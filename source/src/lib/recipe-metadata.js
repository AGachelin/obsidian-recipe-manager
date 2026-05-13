import { FRONTMATTER } from "../shared/constants/recipe.js";

const LIVE_BIND_KEYS = [
    FRONTMATTER.VIEW,
    FRONTMATTER.INGREDIENTS,
    FRONTMATTER.PREP_DURATION,
    FRONTMATTER.COOK_DURATION,
    FRONTMATTER.REST_DURATION,
    FRONTMATTER.OVEN,
    FRONTMATTER.NOTE,
    FRONTMATTER.SOURCE,
    FRONTMATTER.TAGS,
];

export function readRecipeLiveMetadata(mb, path) {
    const at = (key) => mb.parseBindTarget(key, path);
    const meta = {};
    for (const key of LIVE_BIND_KEYS) {
        meta[key] = mb.getMetadata(at(key));
    }
    return meta;
}

export function isRecipeViewMode(meta) {
    const v = meta[FRONTMATTER.VIEW];
    return v === true || v === "true";
}

export function attachRecipeLiveSubscriptions(mb, component, path, refresh) {
    let coalescing = false;
    const schedule = () => {
        if (coalescing) return;
        coalescing = true;
        queueMicrotask(() => {
            coalescing = false;
            void refresh();
        });
    };
    const watch = (bindTarget) => mb.subscribeToMetadata(bindTarget, component, schedule);
    const at = (key) => mb.parseBindTarget(key, path);
    watch(at(FRONTMATTER.VIEW));
    watch(mb.createBindTarget("frontmatter", path, ["ingredients"], false));
    watch(at(FRONTMATTER.PERSON.LABEL));
}
