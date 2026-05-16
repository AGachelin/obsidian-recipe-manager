import { FRONTMATTER } from "../../shared/constants/recipe.js";

export function trimmedString(v) {
    return v == null ? "" : String(v).trim();
}

export function readMetaNonEmptyNote(meta) {
    const n = meta[FRONTMATTER.NOTE];
    if (n == null || n === "") return false;
    const num = Number(n);
    return Number.isFinite(num) && num > 0;
}

export function readMetaNonEmptySource(meta) {
    return trimmedString(meta[FRONTMATTER.SOURCE]).length > 0;
}

export function readMetaNonEmptyOven(meta) {
    const o = meta[FRONTMATTER.OVEN];
    if (o == null || o === "") return false;
    const num = Number(o);
    return Number.isFinite(num) && num > 0;
}

export function readMetaHasTags(meta) {
    const t = meta[FRONTMATTER.TAGS];
    if (!Array.isArray(t) || t.length === 0) return false;
    return t.some((x) => trimmedString(x).length > 0);
}

/** @param {{ lastValue?: unknown }} durationInput */
export function durationHasDisplay(durationInput) {
    return Number(durationInput.lastValue) > 0;
}
