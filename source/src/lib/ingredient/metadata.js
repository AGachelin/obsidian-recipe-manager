import {
    INGREDIENT_LIVE_READ_KEYS,
} from "../../shared/constants/ingredient.js";

/**
 * @param {*} mb
 * @param {string} path
 */
export function readIngredientLiveMetadata(mb, path) {
    const at = (key) => mb.parseBindTarget(key, path);
    const meta = {};
    for (const key of INGREDIENT_LIVE_READ_KEYS) {
        meta[key] = mb.getMetadata(at(key));
    }
    return meta;
}
