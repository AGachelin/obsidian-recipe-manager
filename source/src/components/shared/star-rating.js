import { RECIPE_LAYOUT } from "../../shared/constants/recipe-ui.js";

const MAX_STARS = 5;

/**
 * @param {HTMLElement} parent
 * @param {unknown} rating
 * @param {{ max?: number }} [options]
 */
export function mountStarRating(parent, rating, { max = MAX_STARS } = {}) {
    const value = Math.max(0, Math.min(max, Number(rating) || 0));
    const wrap = parent.createDiv({
        cls: `${RECIPE_LAYOUT.starRating} recipe-star-rating`,
        attr: { "aria-label": `Rating ${value} out of ${max}` },
    });

    for (let i = 1; i <= max; i++) {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        const star = wrap.createEl("span", { cls: RECIPE_LAYOUT.star });
        star.style.setProperty("--star-fill", String(fill));
        star.setAttribute("aria-hidden", "true");
    }

    return wrap;
}
