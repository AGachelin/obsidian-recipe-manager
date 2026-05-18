import { FRONTMATTER, FRONTMATTER_DEFAULTS, FRONTMATTER_LABELS } from "../../shared/constants/recipe.js";

/**
 * Values read from frontmatter / metadata for one render pass.
 * @param {Record<string, unknown>} [metadata]
 */
export function buildRecipeBindSnapshot(metadata) {
    const m = metadata ?? {};
    return {
        prepSec: Number(m[FRONTMATTER.PREP_DURATION]) || 0,
        cookSec: Number(m[FRONTMATTER.COOK_DURATION]) || 0,
        restSec: Number(m[FRONTMATTER.REST_DURATION]) || 0,
        coolSec: Number(m[FRONTMATTER.COOL_DURATION]) || 0,
        freezeSec: Number(m[FRONTMATTER.FREEZE_DURATION]) || 0,
        noteValue: m[FRONTMATTER.NOTE] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.NOTE],
        ovenValue: m[FRONTMATTER.OVEN] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.OVEN],
        sourceValue: m[FRONTMATTER.SOURCE] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.SOURCE],
        thumbnailValue: m[FRONTMATTER.THUMBNAIL] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.THUMBNAIL],
        ingredientsValue: m[FRONTMATTER.INGREDIENTS] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.INGREDIENTS],
    };
}

/**
 * @param {{ prepDuration: { label: string }, cookDuration: { label: string }, restDuration: { label: string } }} renderer
 */
export function assignDurationLabels(renderer) {
    renderer.prepDuration.label = FRONTMATTER_LABELS.PREP;
    renderer.cookDuration.label = FRONTMATTER_LABELS.COOK;
    renderer.restDuration.label = FRONTMATTER_LABELS.REST;
    renderer.coolDuration.label = FRONTMATTER_LABELS.COOL;
    renderer.freezeDuration.label = FRONTMATTER_LABELS.FREEZE;
}
