const INGREDIENTS_FOLDER = "Ingredients";

/** @typedef {{ label: string, children: Map<string, CatalogNode>, ingredients: string[] }} CatalogNode */

/** @type {{ root: CatalogNode, uncategorized: string[] } | null} */
let cache = null;

/**
 * @returns {CatalogNode}
 */
export function createCatalogNode(label) {
    return { label, children: new Map(), ingredients: [] };
}

/**
 * @param {import("obsidian").App} app
 * @returns {{ root: CatalogNode, uncategorized: string[] }}
 */
export function buildIngredientCatalog(app) {
    const root = createCatalogNode("");
    const uncategorized = [];

    const folder = app.vault.getAbstractFileByPath(INGREDIENTS_FOLDER);
    if (!folder || !("children" in folder) || !folder.children) {
        return { root, uncategorized };
    }

    const files = app.vault.getMarkdownFiles().filter((f) => f.path.startsWith(`${INGREDIENTS_FOLDER}/`));

    for (const file of files) {
        const name = file.basename;
        const fm = app.metadataCache.getFileCache(file)?.frontmatter ?? {};
        const taxonomy = Array.isArray(fm.taxonomy)
            ? fm.taxonomy.map((s) => String(s).trim()).filter(Boolean)
            : [];

        if (taxonomy.length === 0) {
            uncategorized.push(name);
            continue;
        }

        let node = root;
        for (let i = 0; i < taxonomy.length; i++) {
            const seg = taxonomy[i];
            if (!node.children.has(seg)) {
                node.children.set(seg, createCatalogNode(seg));
            }
            node = node.children.get(seg);
        }
        node.ingredients.push(name);
    }

    const sortNode = (node) => {
        node.ingredients.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
        for (const child of node.children.values()) {
            sortNode(child);
        }
    };
    sortNode(root);
    uncategorized.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

    return { root, uncategorized };
}

/**
 * @param {import("obsidian").App} app
 */
export function getIngredientCatalog(app) {
    if (!cache) {
        cache = buildIngredientCatalog(app);
    }
    return cache;
}

/**
 * @param {import("obsidian").App} app
 */
export function refreshIngredientCatalog(app) {
    cache = buildIngredientCatalog(app);
    return cache;
}

let invalidationAttached = false;

/**
 * @param {import("obsidian").App} app
 */
export function attachIngredientCatalogInvalidation(app) {
    if (invalidationAttached) return;
    invalidationAttached = true;

    let timer = null;
    const bump = () => {
        cache = null;
    };
    const schedule = () => {
        if (timer != null) window.clearTimeout(timer);
        timer = window.setTimeout(bump, 400);
    };
    app.metadataCache.on("changed", schedule);
    app.vault.on("create", schedule);
    app.vault.on("delete", schedule);
    app.vault.on("rename", schedule);
}

/**
 * @param {{ root: CatalogNode, uncategorized: string[] }} catalog
 * @returns {string[]}
 */
export function flattenCatalogNames(catalog) {
    const names = [...catalog.uncategorized];
    const walk = (node) => {
        names.push(...node.ingredients);
        for (const child of sortedCatalogChildren(node)) {
            walk(child);
        }
    };
    walk(catalog.root);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/**
 * @param {CatalogNode} node
 * @returns {CatalogNode[]}
 */
export function sortedCatalogChildren(node) {
    return [...node.children.entries()]
        .sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: "base" }))
        .map(([, n]) => n);
}

/**
 * @param {CatalogNode} node
 * @param {string} needle
 * @returns {boolean}
 */
function nodeMatchesSearch(node, needle) {
    if (!needle) return true;
    const n = needle.toLowerCase();
    for (const ing of node.ingredients) {
        if (ing.toLowerCase().includes(n)) return true;
    }
    for (const child of node.children.values()) {
        if (nodeMatchesSearch(child, n)) return true;
    }
    return false;
}

/**
 * Deep-clone catalog tree pruning branches that do not match search.
 *
 * @param {CatalogNode} node
 * @param {string} needle
 */
export function filterCatalogNode(node, needle) {
    if (!needle) return node;
    const filtered = createCatalogNode(node.label);
    const n = needle.toLowerCase();

    for (const ing of node.ingredients) {
        if (ing.toLowerCase().includes(n)) {
            filtered.ingredients.push(ing);
        }
    }

    for (const [key, child] of node.children.entries()) {
        if (nodeMatchesSearch(child, needle)) {
            filtered.children.set(key, filterCatalogNode(child, needle));
        }
    }

    return filtered;
}

/**
 * Remove ingredient names already used in a group from a catalog subtree.
 *
 * @param {CatalogNode} node
 * @param {ReadonlySet<string>} excludeLower Lowercase names to omit
 * @returns {CatalogNode}
 */
export function excludeNamesFromCatalogNode(node, excludeLower) {
    if (excludeLower.size === 0) return node;
    const filtered = createCatalogNode(node.label);

    for (const ing of node.ingredients) {
        if (!excludeLower.has(ing.toLowerCase())) {
            filtered.ingredients.push(ing);
        }
    }

    for (const [key, child] of node.children.entries()) {
        const next = excludeNamesFromCatalogNode(child, excludeLower);
        if (next.ingredients.length > 0 || next.children.size > 0) {
            filtered.children.set(key, next);
        }
    }

    return filtered;
}
