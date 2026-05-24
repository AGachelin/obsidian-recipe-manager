export { getFrontmatterLabels } from "../i18n/index.js";

export const FRONTMATTER = Object.freeze({
    CSS_CLASSES: 'cssclasses',
    COOK_DURATION: 'cook_duration',
    INGREDIENTS: 'ingredients',
    INGREDIENT_GROUPS: 'ingredient_groups',
    INGREDIENTS_FIELDS: {
        AMOUNT: 'amount',
        LAST_ID: 'last_id',
        ID: 'id',
        NAME: 'name',
        UNIT: 'unit',
        GROUP_ID: 'group_id',
        ORDER: 'order',
    },
    NOTE: 'note',
    OVEN: 'oven',
    PERSON: {
        LABEL: 'person',
        RAW: 'person.raw'
    },
    PREP_DURATION: 'prep_duration',
    REST_DURATION: 'rest_duration',
    COOL_DURATION: 'cool_duration',
    FREEZE_DURATION: 'freeze_duration',
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
export const DEFAULT_INGREDIENT_GROUP_ID = 'default';

export const RECIPE_LIVE_SUBSCRIPTION_KEYS = Object.freeze([
    FRONTMATTER.VIEW,
    FRONTMATTER.INGREDIENT_GROUPS,
    FRONTMATTER.INGREDIENTS,
    FRONTMATTER.PREP_DURATION,
    FRONTMATTER.COOK_DURATION,
    FRONTMATTER.REST_DURATION,
    FRONTMATTER.COOL_DURATION,
    FRONTMATTER.FREEZE_DURATION,
    FRONTMATTER.OVEN,
    FRONTMATTER.NOTE,
    FRONTMATTER.SOURCE,
    FRONTMATTER.TAGS,
    FRONTMATTER.THUMBNAIL,
    FRONTMATTER.PERSON.RAW,
]);


/** Keys read into the metadata snapshot passed to {@link RecipeRenderer#render}. */
export const RECIPE_LIVE_READ_KEYS = Object.freeze([
    FRONTMATTER.VIEW,
    FRONTMATTER.INGREDIENT_GROUPS,
    FRONTMATTER.INGREDIENTS,
    FRONTMATTER.PREP_DURATION,
    FRONTMATTER.COOK_DURATION,
    FRONTMATTER.REST_DURATION,
    FRONTMATTER.COOL_DURATION,
    FRONTMATTER.FREEZE_DURATION,
    FRONTMATTER.OVEN,
    FRONTMATTER.NOTE,
    FRONTMATTER.SOURCE,
    FRONTMATTER.TAGS,
    FRONTMATTER.THUMBNAIL,
    FRONTMATTER.PERSON.RAW,
]);

export const FRONTMATTER_DEFAULTS = Object.freeze({
    [FRONTMATTER.INGREDIENT_GROUPS]: [
        { id: DEFAULT_INGREDIENT_GROUP_ID, label: 'Ingredients', order: 0 },
    ],
    [FRONTMATTER.INGREDIENTS]: {
        [FRONTMATTER.INGREDIENTS_FIELDS.LAST_ID]: 0,
    },
    DURATION: 0,
    [FRONTMATTER.PERSON.RAW]: 4,
    [FRONTMATTER.VIEW]: false,
    [FRONTMATTER.TAGS]: [],
    [FRONTMATTER.OVEN]: 0,
    [FRONTMATTER.NOTE]: 0,
    [FRONTMATTER.SOURCE]: '',
    [FRONTMATTER.THUMBNAIL]: '',
    [FRONTMATTER.CSS_CLASSES]: 'recipe-ui',
    [INGREDIENT_NOTEBOOK.RHO]: 1,
    [INGREDIENT_NOTEBOOK.SPECIFIC_WEIGHT]: 1,
});

