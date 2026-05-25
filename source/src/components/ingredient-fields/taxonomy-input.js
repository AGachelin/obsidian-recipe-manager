import { INGREDIENT_FRONTMATTER } from "../../shared/constants/ingredient.js";
import { INGREDIENT_LAYOUT } from "../../shared/constants/ingredient-ui.js";
import { getIngredientNoteLabels } from "../../shared/i18n/index.js";

export class TaxonomyInput {
    /**
     * @param {string} path
     * @param {import("../../shared/i18n/language.js").AppLanguage} lang
     */
    constructor(path, lang) {
        this.path = path;
        this.L = getIngredientNoteLabels(lang);
    }

    /**
     * @param {*} mb
     * @param {string[]} taxonomy
     */
    mount(mb, parent, taxonomy) {
        const row = parent.createDiv({ cls: INGREDIENT_LAYOUT.fieldRow });
        row.createEl("label", {
            cls: INGREDIENT_LAYOUT.fieldLabel,
            text: this.L.TAXONOMY,
            attr: { for: "ingredient-taxonomy-input" },
        });

        const segments = Array.isArray(taxonomy)
            ? taxonomy.map((s) => String(s).trim()).filter(Boolean)
            : [];
        const display = segments.join(" / ");

        const input = row.createEl("input", {
            cls: INGREDIENT_LAYOUT.fieldInput,
            type: "text",
            attr: {
                id: "ingredient-taxonomy-input",
                placeholder: this.L.TAXONOMY_PLACEHOLDER,
                spellcheck: "false",
            },
            value: display,
        });

        row.createEl("p", {
            cls: INGREDIENT_LAYOUT.taxonomyHint,
            text: this.L.TAXONOMY_HINT,
        });

        const target = mb.parseBindTarget(INGREDIENT_FRONTMATTER.TAXONOMY, this.path);

        const commit = () => {
            const next = String(input.value)
                .split("/")
                .map((s) => s.trim())
                .filter(Boolean);
            mb.setMetadata(target, next);
        };

        input.addEventListener("change", commit);
        input.addEventListener("blur", commit);
    }
}
