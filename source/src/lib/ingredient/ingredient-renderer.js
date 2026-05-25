import {
    INGREDIENT_FRONTMATTER,
    INGREDIENT_FRONTMATTER_DEFAULTS,
} from "../../shared/constants/ingredient.js";
import { INGREDIENT_LAYOUT } from "../../shared/constants/ingredient-ui.js";
import { getIngredientNoteLabels } from "../../shared/i18n/index.js";
import { TaxonomyInput } from "../../components/ingredient-fields/taxonomy-input.js";
import { WeightInput } from "../../components/ingredient-fields/weight-input.js";
import { attachIngredientCatalogInvalidation } from "../../shared/vault/ingredient-catalog.js";
import {disableScrollToChange} from "../disable-scroll-change.js";

export class IngredientRenderer {
    /**
     * @param {string} path
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     */
    constructor(path, lang) {
        this.path = path;
        this.lang = lang;
        this.L = getIngredientNoteLabels(lang);
        this.volumetricWeight = new WeightInput(
            path,
            INGREDIENT_FRONTMATTER.LIQUID,
            this.L.VOLUMETRIC_WEIGHT
        );
        this.unitWeight = new WeightInput(
            path,
            INGREDIENT_FRONTMATTER.SINGLE,
            this.L.UNIT_WEIGHT
        );
        this.taxonomy = new TaxonomyInput(path, lang);
    }

    /**
     * @param {*} mb
     * @param {HTMLElement} container
     * @param {import("obsidian").Component} component
     * @param {Record<string, unknown>} metadata
     */
    render(mb, container, component, metadata) {
        const app = mb.mb?.app ?? mb.app;
        if (app) {
            attachIngredientCatalogInvalidation(app);
        }

        container.empty();
        container.classList.add(INGREDIENT_LAYOUT.root);
        disableScrollToChange(container);
        const meta = metadata ?? {};
        const liquid =
            meta[INGREDIENT_FRONTMATTER.LIQUID] ??
            INGREDIENT_FRONTMATTER_DEFAULTS[INGREDIENT_FRONTMATTER.LIQUID];
        const single =
            meta[INGREDIENT_FRONTMATTER.SINGLE] ??
            INGREDIENT_FRONTMATTER_DEFAULTS[INGREDIENT_FRONTMATTER.SINGLE];
        const taxonomy =
            meta[INGREDIENT_FRONTMATTER.TAXONOMY] ??
            INGREDIENT_FRONTMATTER_DEFAULTS[INGREDIENT_FRONTMATTER.TAXONOMY];

        this.volumetricWeight.mount(mb, component, container, liquid);
        this.unitWeight.mount(mb, component, container, single);
        this.taxonomy.mount(mb, container, taxonomy);
    }
}
