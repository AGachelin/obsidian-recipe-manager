/** @typedef {"en" | "fr"} AppLanguage */

export const SUPPORTED_LANGUAGES = Object.freeze(["en", "fr"]);
export const DEFAULT_LANGUAGE = /** @type {AppLanguage} */ ("en");

/**
 * @param {unknown} language
 * @returns {AppLanguage}
 */
export function normalizeLanguage(language) {
    const code = String(language ?? "")
        .trim()
        .toLowerCase()
        .slice(0, 2);
    return code === "fr" ? "fr" : "en";
}

/**
 * Language for a live page: explicit template argument, then js-engine plugin, else English.
 *
 * @param {unknown} [explicit]
 * @param {*} [engine]
 * @returns {AppLanguage}
 */
export function resolveLanguage(explicit, engine) {
    if (explicit != null && String(explicit).trim() !== "") {
        return normalizeLanguage(explicit);
    }
    if (engine?.plugin?.language != null) {
        return normalizeLanguage(engine.plugin.language);
    }
    return DEFAULT_LANGUAGE;
}
