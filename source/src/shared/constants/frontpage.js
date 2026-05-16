/** Max duration filter upper bound when meta is missing (one week in seconds). */
export const FRONTPAGE_DEFAULT_MAX_DURATION_SEC = 604800;

/**
 * Frontmatter keys for the recipe index (“front page”) note.
 * Keep in sync with the note template YAML and with {@link FRONTPAGE_LAYOUT}.
 */
export const FrontpageFm = Object.freeze({
    FILTER_NOTE_MIN: "filter_note_min",
    FILTER_NOTE_MAX: "filter_note_max",
    FILTER_PREP_MAX_SEC: "filter_prep_max_sec",
    FILTER_COOK_MAX_SEC: "filter_cook_max_sec",
    FILTER_REST_MAX_SEC: "filter_rest_max_sec",
    FILTER_SOURCE_SUBSTR: "filter_source_substr",
    FILTER_TAGS: "filter_tags",
    FILTER_INGREDIENTS_STATE: "filter_ingredients_state",
    FILTER_INGREDIENTS_AMOUNT: "filter_ingredients_amount",
    FILTER_INGREDIENTS_UNIT: "filter_ingredients_unit",
    FILTER_INGREDIENTS_SEARCH: "filter_ingredients_search",
});

/** Subscribe to these keys so dependent UI (e.g. ingredient filter list) stays fresh. */
export const FRONTPAGE_LIVE_SUBSCRIPTION_KEYS = Object.freeze([FrontpageFm.FILTER_INGREDIENTS_STATE]);

/**
 * @param {string} ingredientName
 */
export function ingredientFilterStateBindKey(ingredientName) {
    return `${FrontpageFm.FILTER_INGREDIENTS_STATE}["${ingredientName}"]`;
}

/**
 * @param {string} ingredientName
 */
export function ingredientFilterAmountBindKey(ingredientName) {
    return `${FrontpageFm.FILTER_INGREDIENTS_AMOUNT}["${ingredientName}"]`;
}

/**
 * @param {string} ingredientName
 */
export function ingredientFilterUnitBindKey(ingredientName) {
    return `${FrontpageFm.FILTER_INGREDIENTS_UNIT}["${ingredientName}"]`;
}
