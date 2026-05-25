import {
    INGREDIENT_FRONTMATTER,
    INGREDIENT_FRONTMATTER_DEFAULTS,
    INGREDIENT_UI_CLASS,
    INGREDIENTS_FOLDER,
} from "../../shared/constants/ingredient.js";
import { refreshIngredientCatalog } from "../../shared/vault/ingredient-catalog.js";

const INGREDIENT_LIVE_BLOCK = `\`\`\`js-engine
return (await engine.importJs("source/src/lib/ingredient-live.js")).setupIngredientLive(
    engine,
    context,
    container,
    component
);
\`\`\``;

/**
 * @param {string} raw
 */
export function sanitizeIngredientFileName(raw) {
    const trimmed = String(raw ?? "").trim().replace(/[\\/:*?"<>|#]/g, "");
    return trimmed.slice(0, 120) || "ingredient";
}

/**
 * @param {import("obsidian").App} app
 * @param {string} rawName
 */
export async function createIngredientNote(app, rawName) {
    const basename = sanitizeIngredientFileName(rawName);
    const path = `${INGREDIENTS_FOLDER}/${basename}.md`;
    const existing = app.vault.getAbstractFileByPath(path);
    if (existing) {
        return { ok: false, reason: "exists", basename, path };
    }

    const content = `---
${INGREDIENT_FRONTMATTER.TAXONOMY}: []
${INGREDIENT_FRONTMATTER.LIQUID}: ${INGREDIENT_FRONTMATTER_DEFAULTS[INGREDIENT_FRONTMATTER.LIQUID]}
${INGREDIENT_FRONTMATTER.SINGLE}: ${INGREDIENT_FRONTMATTER_DEFAULTS[INGREDIENT_FRONTMATTER.SINGLE]}
cssclasses:
  - ${INGREDIENT_UI_CLASS}
---

${INGREDIENT_LIVE_BLOCK}
`;

    await app.vault.create(path, content);
    refreshIngredientCatalog(app);
    return { ok: true, basename, path };
}
