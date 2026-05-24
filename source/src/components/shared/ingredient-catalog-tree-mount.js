import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";
import { getUILabels } from "../../shared/i18n/index.js";
import {
    filterCatalogNode,
    getIngredientCatalog,
    sortedCatalogChildren,
} from "../../shared/vault/ingredient-catalog.js";
import { mountCollapsibleSection } from "../frontpage/collapsible-sections.js";

/**
 * Mount nested catalog tree; invoke renderLeaf for each ingredient name.
 *
 * @param {HTMLElement} parent
 * @param {import("obsidian").App} app
 * @param {import("../../shared/i18n/language.js").AppLanguage} lang
 * @param {string} searchNeedle
 * @param {(ingredientName: string, leafParent: HTMLElement) => void} renderLeaf
 */
export function mountIngredientCatalogTree(parent, app, lang, searchNeedle, renderLeaf) {
    parent.empty();
    const L = getUILabels(lang);
    const catalog = getIngredientCatalog(app);
    const filteredRoot = filterCatalogNode(catalog.root, searchNeedle);

    const walk = (host, node, nested) => {
        for (const child of sortedCatalogChildren(node)) {
            if (child.children.size === 0 && child.ingredients.length === 0) continue;

            const container = nested ? host.createDiv({ cls: "catalog-tree-nested" }) : host;
            const content = mountCollapsibleSection(
                container,
                child.label,
                false,
                FRONTPAGE_LAYOUT.ingredientSection
            );

            for (const name of child.ingredients) {
                renderLeaf(name, content);
            }
            walk(content, child, true);
        }
    };

    walk(parent, filteredRoot, false);

    const unc = searchNeedle
        ? catalog.uncategorized.filter((n) =>
              n.toLowerCase().includes(searchNeedle.toLowerCase())
          )
        : catalog.uncategorized;

    if (unc.length > 0) {
        const content = mountCollapsibleSection(parent, L.CATALOG_UNCATEGORIZED, false);
        for (const name of unc) {
            renderLeaf(name, content);
        }
    }
}
