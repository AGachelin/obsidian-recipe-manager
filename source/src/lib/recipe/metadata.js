/**
 * Live metadata for recipe pages: read-through keys + subscriptions for reactive re-render.
 */
import {
    FRONTMATTER,
    RECIPE_LIVE_READ_KEYS,
    RECIPE_LIVE_SUBSCRIPTION_KEYS,
} from "../../shared/constants/recipe.js";
import { subscribeToFrontmatterKeys } from "../render/subscribe-metadata.js";

export function readRecipeLiveMetadata(mb, path) {
    const at = (key) => mb.parseBindTarget(key, path);
    const meta = {};
    for (const key of RECIPE_LIVE_READ_KEYS) {
        meta[key] = mb.getMetadata(at(key));
    }
    return meta;
}

export function isRecipeViewMode(meta) {
    const v = meta[FRONTMATTER.VIEW];
    return v === true || v === "true";
}

export function attachRecipeLiveSubscriptions(mb, component, path, refresh) {
    subscribeToFrontmatterKeys(mb, component, path, RECIPE_LIVE_SUBSCRIPTION_KEYS, refresh, {
        ingredientsObject: true,
    });
}
