export const FRONTMATTER_LABELS = Object.freeze({
    NOTE: 'Note',
    OVEN: 'Oven temperature',
    PERSON: 'Nombre de personnes',
    COOK: 'Cuisson',
    PREP: 'Préparation',
    REST: 'Repos',
});

export const FRONTMATTER = Object.freeze({
    AVAILABLE_INGREDIENTS: 'available_ingredients',
    CSS_CLASSES: 'cssclasses',
    COOK_DURATION: 'cook_duration',
    INGREDIENTS: 'ingredients',
    INGREDIENTS_FIELDS: {
        AMOUNT: 'amount',
        LAST_ID: 'last_id',
        ID: 'id',
        NAME: 'name',
        UNIT: 'unit',
    },
    NOTE: 'note',
    OVEN: 'oven',
    PERSON: {
        LABEL: 'person',
        CURRENT: 'person.current',
        RAW: 'person.raw'
    },
    PREP_DURATION: 'prep_duration',
    REST_DURATION: 'rest_duration',
    SOURCE: 'source',
    TAGS: 'tags',
    THUMBNAIL: 'thumbnail',
    VIEW: 'view',
});

export const INGREDIENT_NOTEBOOK = Object.freeze({
    RHO: "liquid",
    SPECIFIC_WEIGHT: "single",
});

/** Frontmatter keys that trigger a full recipe live re-render when changed. */
export const RECIPE_LIVE_SUBSCRIPTION_KEYS = Object.freeze([
    FRONTMATTER.VIEW
]);

/** Keys read into the metadata snapshot passed to {@link RecipeRenderer#render}. */
export const RECIPE_LIVE_READ_KEYS = Object.freeze([
    FRONTMATTER.VIEW,
    FRONTMATTER.INGREDIENTS,
    FRONTMATTER.PREP_DURATION,
    FRONTMATTER.COOK_DURATION,
    FRONTMATTER.REST_DURATION,
    FRONTMATTER.OVEN,
    FRONTMATTER.NOTE,
    FRONTMATTER.SOURCE,
    FRONTMATTER.TAGS,
]);

export const FRONTMATTER_DEFAULTS = Object.freeze({
    [FRONTMATTER.AVAILABLE_INGREDIENTS]: [],
    [FRONTMATTER.INGREDIENTS]: {
        [FRONTMATTER.INGREDIENTS_FIELDS.LAST_ID]: 0,
    },
    [FRONTMATTER.PERSON.CURRENT]: 1,
    DURATION: 0,
    [FRONTMATTER.PERSON.RAW]: 1,
    [FRONTMATTER.VIEW]: false,
    [FRONTMATTER.TAGS]: [],
    [FRONTMATTER.OVEN]: 0,
    [FRONTMATTER.NOTE]: 0,
    [FRONTMATTER.SOURCE]: '',
    [FRONTMATTER.CSS_CLASSES]: 'recipe-ui',
    [INGREDIENT_NOTEBOOK.RHO]: 1,
    [INGREDIENT_NOTEBOOK.SPECIFIC_WEIGHT]: 1,
});
