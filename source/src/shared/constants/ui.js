export const UI_LABELS = Object.freeze({
    INGREDIENTS: 'Ingredients',
    ADD_INGREDIENT: 'add ingredient',
    NEW_INGREDIENT: 'new ingredient',
    DELETE: 'x',
});

export const UI_CLASSES = Object.freeze({
    /**
     * Applied to the root element in obsidian ; class to import
     */
    RECIPE_UI: 'recipe-ui',
    /** Root element created by the recipe js-engine block */
    RECIPE_ROOT: 'recipe-root',
    /** View / edit control strip */
    RECIPE_TOGGLE_BAR: 'recipe-toggle-bar',
    INGREDIENTS_CONTAINER: 'ingredients-container',
    INGREDIENT_ROW: 'ingredient-row',
    ADD_INGREDIENT_CONTAINER: 'add-ingredient-container',
    PERSON_CONTAINER: 'person-container',
    DURATIONS_CONTAINER: 'durations-container',
    DURATION_INPUT_GROUP: 'duration-input-group',
    DURATION_INPUTS: 'duration-inputs',
    DURATION_VIEW_GROUP: 'duration-view-group',
    OVEN_CONTAINER: 'oven-container',
    NOTE_CONTAINER: 'note-container',
    CONTENT_CONTAINER: 'content-container',
    SOURCE_CONTAINER: 'source-container',
    TAGS_CONTAINER: 'tags-container',
    INPUT_FIELD: 'input-field',
    VIEW_FIELD: 'view-field',
    /** Wrapper for Meta Bind VIEW fields declared with `[math(hidden):…]` / `[text(hidden):…]` */
    HIDDEN_VIEW_FIELD: 'hidden-view-field',
    /** Single-use host for `wrapInMDRC`*/
    MDRC_MOUNT: 'mdrc-mount',
    CONTENT_INPUT: 'content-input',
    CONTENT_VIEW: 'content-view',
});
