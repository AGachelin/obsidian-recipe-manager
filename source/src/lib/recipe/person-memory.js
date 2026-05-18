import { FRONTMATTER } from "../../shared/constants/recipe.js";

/** Meta Bind memory bind for scaled serving count (not persisted in frontmatter). */
export const PERSON_CURRENT_MEMORY_BIND = 'memory^person["current"]';

/**
 * @param {*} mb Meta Bind API
 * @param {string} path
 */
export function createPersonCurrentMemoryBind(mb, path) {
    return mb.createBindTarget("memory", path, ["person", "current"], true);
}

/**
 * @param {*} mb
 * @param {string} path
 */
export function resetPersonCurrentFromRaw(mb, path) {
    const rawTarget = mb.parseBindTarget(FRONTMATTER.PERSON.RAW, path);
    const raw = mb.getMetadata(rawTarget);
    const n = Number(raw);
    const value = Number.isFinite(n) && n > 0 ? n : 1;
    mb.setMetadata(createPersonCurrentMemoryBind(mb, path), value);
    return value;
}
