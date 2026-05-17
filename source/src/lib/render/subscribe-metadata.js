import { createCoalescedScheduler } from "../coalesced-refresh.js";

/**
 * Subscribe to frontmatter keys on a note; coalesces rapid updates into one `refresh` per microtask.
 *
 * @param {*} mb Meta Bind API
 * @param {import("obsidian").Component} component
 * @param {string} path Note path
 * @param {readonly string[]} keys Frontmatter field names (passed to `parseBindTarget`)
 * @param {() => void} refresh
 * @param {{ ingredientsObject?: boolean }} [options] Also watch the whole `ingredients` object bind
 */
export function subscribeToFrontmatterKeys(mb, component, path, keys, refresh, options = {}) {
    const { schedule } = createCoalescedScheduler(refresh);
    const watch = (bindTarget) => mb.subscribeToMetadata(bindTarget, component, schedule);
    const at = (key) => mb.parseBindTarget(key, path);

    for (const key of keys) {
        watch(at(key));
    }
    if (options.ingredientsObject) {
        watch(mb.createBindTarget("frontmatter", path, ["ingredients"], false));
    }
}
