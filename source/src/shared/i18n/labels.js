import { normalizeLanguage } from "./language.js";

/** @typedef {ReturnType<typeof getUILabels>} RecipeUILabels */
/** @typedef {ReturnType<typeof getFrontmatterLabels>} FrontmatterLabels */
/** @typedef {ReturnType<typeof getFrontpageLabels>} FrontpageLabels */

const RECIPE_UI_FR = Object.freeze({
    INGREDIENTS: "Ingrédients",
    ADD_INGREDIENT: "Ajouter un ingrédient",
    NEW_INGREDIENT: "Nouvel ingrédient",
    DELETE: "Supprimer",
    MODE_READ: "Lecture",
    READ: "Visualiser",
    MODE_EDIT: "Modification",
    EDIT: "Modifier",
    SOURCE_LABEL: "Source",
    SOURCE_PLACEHOLDER: "Saisir la source",
    THUMBNAIL_LABEL: "Vignette",
    THUMBNAIL_PLACEHOLDER: "Chemin d'image ou lien wiki",
    PERSON_SUFFIX: "personnes",
    PERSON_FIELD_LABEL: "Nombre de personnes : ",
    OVEN_PLACEHOLDER: "Saisir la température du four",
    OVEN_LABEL: "Température du four : ",
    OVEN_LABEL_SHORT: "Four : ",
    RESET: "Réinitialiser",
    ADD_GROUP: "Ajouter un groupe",
    DELETE_GROUP: "Supprimer le groupe",
    GROUP_NAME_PLACEHOLDER: "Nom du groupe",
    CATALOG_PICKER_TITLE: "Ajouter un ingrédient",
    CATALOG_SEARCH_PLACEHOLDER: "Filtrer les ingrédients…",
    CATALOG_UNCATEGORIZED: "Sans catégorie",
    CATALOG_ADD: "Ajouter",
    CATALOG_NO_MATCH: "Aucun ingrédient correspondant.",
    CREATE_INGREDIENT: "Créer l'ingrédient",
    DRAG_HANDLE: "Glisser",
});

const RECIPE_UI_EN = Object.freeze({
    INGREDIENTS: "Ingredients",
    ADD_INGREDIENT: "Add ingredient",
    NEW_INGREDIENT: "New ingredient",
    DELETE: "Remove",
    MODE_READ: "Reading",
    READ: "Read",
    MODE_EDIT: "Editing",
    EDIT: "Edit",
    SOURCE_LABEL: "Source",
    SOURCE_PLACEHOLDER: "Enter source",
    THUMBNAIL_LABEL: "Thumbnail",
    THUMBNAIL_PLACEHOLDER: "Image path or wikilink",
    PERSON_SUFFIX: "servings",
    PERSON_FIELD_LABEL: "Servings: ",
    OVEN_PLACEHOLDER: "Enter oven temperature",
    OVEN_LABEL: "Oven temperature: ",
    OVEN_LABEL_SHORT: "Oven: ",
    RESET: "Reset",
    ADD_GROUP: "Add group",
    DELETE_GROUP: "Delete group",
    GROUP_NAME_PLACEHOLDER: "Group name",
    CATALOG_PICKER_TITLE: "Add ingredient",
    CATALOG_SEARCH_PLACEHOLDER: "Filter ingredients…",
    CATALOG_UNCATEGORIZED: "Uncategorized",
    CATALOG_ADD: "Add",
    CATALOG_NO_MATCH: "No matching ingredient found.",
    CREATE_INGREDIENT: "Create ingredient",
    DRAG_HANDLE: "Drag",
});

const FRONTMATTER_LABELS_FR = Object.freeze({
    NOTE: "Note",
    OVEN: "Température du four",
    PERSON: "Nombre de personnes",
    COOK: "Cuisson",
    PREP: "Préparation",
    REST: "Repos",
    COOL: "Frigo",
    FREEZE: "Congélateur",
});

const FRONTMATTER_LABELS_EN = Object.freeze({
    NOTE: "Rating",
    OVEN: "Oven temperature",
    PERSON: "Number of servings",
    COOK: "Cooking",
    PREP: "Prep",
    REST: "Rest",
    COOL: "Fridge",
    FREEZE: "Freezer",
});

const FRONTPAGE_FR = Object.freeze({
    PAGE_TITLE: "Recettes",
    INDEX_HEADING: "Index des recettes",
    NEW_RECIPE: "Nouvelle recette",
    RECIPE_NAME_LABEL: "Nom de la recette",
    RECIPE_NAME_PLACEHOLDER: "Filtrer par nom…",
    RECIPE_NAME_ARIA: "Filtrer les recettes par nom",
    ADVANCED_SEARCH: "Recherche avancée",
    APPLY_FILTERS: "Appliquer les filtres avancés",
    RESET_FILTERS: "Réinitialiser tous les filtres avancés",
    INGREDIENTS_SECTION: "Ingrédients",
    RATING_SECTION: "Note",
    MIN_RATING: "Note min.",
    MAX_RATING: "Note max.",
    DURATIONS_SECTION: "Durées",
    MAX_PREP: "Préparation max.",
    MAX_COOK: "Cuisson max.",
    MAX_REST: "Repos max.",
    MAX_COOL: "Frigo max.",
    MAX_FREEZE: "Congélateur max.",
    TAGS_SECTION: "Étiquettes",
    TAGS_HINT:
        "Les recettes doivent contenir chaque étiquette sélectionnée (vide = pas de filtre par étiquette).",
    SOURCE_SECTION: "Source",
    SOURCE_CONTAINS: "Contient",
    SOURCE_PLACEHOLDER: "la source contient…",
    TABLE_RECIPE: "Recette",
    TABLE_RATING: "Note",
    RECIPES_ROOT: "Recettes",
    EMPTY_ADVANCED:
        'Aucune recette ne correspond aux filtres avancés. Ajustez les filtres puis cliquez sur « Appliquer les filtres avancés ».',
    EMPTY_INSTANT:
        "Aucune recette ne correspond au filtre par nom ou par ingrédient.",
    INGREDIENT_FILTER_PLACEHOLDER: "Filtrer les ingrédients…",
    INGREDIENT_FILTER_EMPTY: "Aucun ingrédient ne correspond à votre recherche.",
    INGREDIENT_FILTER_RESET: "Réinitialiser",
    MAX_AMOUNT_PLACEHOLDER: "quantité max.",
    STATE_ALLOWED: "Autorisé",
    STATE_MUST_HAVE: "Obligatoire",
    STATE_MUST_NOT_HAVE: "Interdit",
});

const FRONTPAGE_EN = Object.freeze({
    PAGE_TITLE: "Recipes",
    INDEX_HEADING: "Recipe index",
    NEW_RECIPE: "New recipe",
    RECIPE_NAME_LABEL: "Recipe name",
    RECIPE_NAME_PLACEHOLDER: "Filter by recipe name…",
    RECIPE_NAME_ARIA: "Filter recipes by name",
    ADVANCED_SEARCH: "Advanced search",
    APPLY_FILTERS: "Apply advanced filters",
    RESET_FILTERS: "Reset all advanced filters",
    INGREDIENTS_SECTION: "Ingredients",
    RATING_SECTION: "Rating",
    MIN_RATING: "Min rating",
    MAX_RATING: "Max rating",
    DURATIONS_SECTION: "Durations",
    MAX_PREP: "Max preparation",
    MAX_COOK: "Max cooking",
    MAX_REST: "Max rest",
    MAX_COOL: "Max cool",
    MAX_FREEZE: "Max freeze",
    TAGS_SECTION: "Tags",
    TAGS_HINT: "Recipes must include every tag you pick here (empty = no tag filter).",
    SOURCE_SECTION: "Source",
    SOURCE_CONTAINS: "Contains",
    SOURCE_PLACEHOLDER: "source contains…",
    TABLE_RECIPE: "Recipe",
    TABLE_RATING: "Rating",
    RECIPES_ROOT: "Recipes",
    EMPTY_ADVANCED:
        'No recipes match the advanced filters. Adjust filters and click "Apply advanced filters".',
    EMPTY_INSTANT: "No recipes match the recipe name or ingredient text filter.",
    INGREDIENT_FILTER_PLACEHOLDER: "Filter ingredients…",
    INGREDIENT_FILTER_EMPTY: "No ingredients match your search.",
    INGREDIENT_FILTER_RESET: "Reset",
    MAX_AMOUNT_PLACEHOLDER: "max amount",
    STATE_ALLOWED: "Allowed",
    STATE_MUST_HAVE: "Must have",
    STATE_MUST_NOT_HAVE: "Must not have",
});

/**
 * @param {unknown} language
 */
export function getUILabels(language) {
    return normalizeLanguage(language) === "fr" ? RECIPE_UI_FR : RECIPE_UI_EN;
}

/**
 * @param {unknown} language
 */
export function getFrontmatterLabels(language) {
    return normalizeLanguage(language) === "fr" ? FRONTMATTER_LABELS_FR : FRONTMATTER_LABELS_EN;
}

/**
 * @param {unknown} language
 */
export function getFrontpageLabels(language) {
    return normalizeLanguage(language) === "fr" ? FRONTPAGE_FR : FRONTPAGE_EN;
}

/**
 * @param {unknown} language
 */
const INGREDIENT_NOTE_FR = Object.freeze({
    VOLUMETRIC_WEIGHT: "Masse volumique (ρ)",
    UNIT_WEIGHT: "Poids d'une unité",
    TAXONOMY: "Taxonomie",
    TAXONOMY_HINT: "Segments séparés par « / » (ex. Viande / Viande rouge)",
    TAXONOMY_PLACEHOLDER: "Catégorie / Sous-catégorie",
});

const INGREDIENT_NOTE_EN = Object.freeze({
    VOLUMETRIC_WEIGHT: "Volumetric weight (ρ)",
    UNIT_WEIGHT: "Weight of one unit",
    TAXONOMY: "Taxonomy",
    TAXONOMY_HINT: "Segments separated by « / » (e.g. Vegetables / Roots)",
    TAXONOMY_PLACEHOLDER: "Category / Subcategory",
});

/**
 * @param {unknown} language
 */
export function getIngredientNoteLabels(language) {
    return normalizeLanguage(language) === "fr" ? INGREDIENT_NOTE_FR : INGREDIENT_NOTE_EN;
}

export function getIngredientFilterStateLabels(language) {
    const L = getFrontpageLabels(language);
    return Object.freeze({
        allowed: L.STATE_ALLOWED,
        must_have: L.STATE_MUST_HAVE,
        must_not_have: L.STATE_MUST_NOT_HAVE,
    });
}
