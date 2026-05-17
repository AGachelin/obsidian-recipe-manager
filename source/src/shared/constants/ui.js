/**
 * Cross-page UI tokens (vault cssclass, Meta Bind mount hosts, widgets reused on recipe + index).
 * Recipe page regions: {@link RECIPE_LAYOUT}. Index page regions: {@link FRONTPAGE_LAYOUT}.
 */
export const UI_LABELS = Object.freeze({
    INGREDIENTS: "Ingredients",
    ADD_INGREDIENT: "Add ingredient",
    NEW_INGREDIENT: "New ingredient",
    DELETE: "Remove",
    MODE_READ: "Reading",
    MODE_EDIT: "Editing",
});

export const UI_CLASSES = Object.freeze({
    /** Applied via note frontmatter `cssclasses` on recipe + front page templates */
    RECIPE_UI: "recipe-ui",
    /** Meta Bind `wrapInMDRC` host — one mount node per field */
    MDRC_MOUNT: "mdrc-mount",
    /** Hidden VIEW sync fields (durations, oven, note, ingredient table) */
    HIDDEN_VIEW_FIELD: "hidden-view-field",
});
