import { DurationInput } from "../components/shared/duration-input.js";
import { IngredientFilter } from "../components/frontpage-fields/ingredient-filter.js";
import { TagsInput } from "../components/shared/tags-input.js";
import { InputConfig } from "../components/config/input-config.js";
import { UI_CLASSES } from "../shared/constants/ui.js";
import { applyMdrcLayoutSteps, wrapMdrcInDedicatedMount } from "./meta-bind-layout.js";
import { queryFilteredRecipes, filterRecipesInstant, recipeDisplayName } from "./frontpage-query.js";

const DEFAULT_MAX_SEC = 604800;

/**
 * @param {*} mb
 * @param {import("obsidian").Component} component
 * @param {string} path
 * @param {function} refreshIngredientRows
 */
function attachFrontpageLiveSubscriptions(mb, component, path, refreshIngredientRows) {
    let coalescing = false;
    const schedule = () => {
        if (coalescing) return;
        coalescing = true;
        queueMicrotask(() => {
            coalescing = false;
            void refreshIngredientRows();
        });
    };
    const watch = (bindTarget) => mb.subscribeToMetadata(bindTarget, component, schedule);
    const at = (key) => mb.parseBindTarget(key, path);
    watch(at("filter_ingredients_state"));
}

/**
 * @param {*} mb
 * @param {HTMLElement} parent
 * @param {string} path
 * @param {string} key
 * @param {string} label
 * @param {{ min: number; max: number; step: number }} spec
 */
function mountSlider(mb, component, parent, path, key, label, spec) {
    const bt = mb.parseBindTarget(key, path);
    const cur = Number(mb.getMetadata(bt));
    const fallback = key.includes("max") ? spec.max : spec.min;
    const def = Number.isFinite(cur) ? cur : fallback;
    const config = new InputConfig("slider", bt, "inline", [
        { name: "defaultValue", value: [String(def)] },
        { name: "minValue", value: [String(spec.min)] },
        { name: "maxValue", value: [String(spec.max)] },
        { name: "stepSize", value: [String(spec.step)] },
    ]).render();
    const wrap = parent.createEl("div", { cls: "frontpage-live__field" });
    wrap.createEl("label", { cls: "frontpage-live__label", text: label });
    const mount = wrap.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
    const field = mb.createInputFieldMountable(path, config);
    mb.wrapInMDRC(field, mount, component);
}

/**
 * @param {*} mb
 * @param {import("obsidian").Component} component
 * @param {HTMLElement} parent
 * @param {string} path
 * @param {string} key
 * @param {string} label
 * @param {string} [placeholder]
 */
function mountText(mb, component, parent, path, key, label, placeholder) {
    const bt = mb.parseBindTarget(key, path);
    const args = [];
    if (placeholder) {
        args.push({ name: "placeholder", value: [placeholder] });
    }
    const config = new InputConfig("text", bt, "inline", args).render();
    const wrap = parent.createEl("div", { cls: "frontpage-live__field" });
    wrap.createEl("label", { cls: "frontpage-live__label", text: label });
    const mount = wrap.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
    const field = mb.createInputFieldMountable(path, config);
    mb.wrapInMDRC(field, mount, component);
}

/**
 * @param {*} mb
 * @param {string} path
 */
function resetAdvancedFilters(mb, path) {
    const at = (k) => mb.parseBindTarget(k, path);
    const set = (k, v) => mb.setMetadata(at(k), v);
    set("filter_note_min", 0);
    set("filter_note_max", 5);
    set("filter_prep_max_sec", DEFAULT_MAX_SEC);
    set("filter_cook_max_sec", DEFAULT_MAX_SEC);
    set("filter_rest_max_sec", DEFAULT_MAX_SEC);
    set("filter_source_substr", "");
    set("filter_tags", []);
    set("filter_ingredients_state", {});
    set("filter_ingredients_amount", {});
    set("filter_ingredients_unit", {});
}

/**
 * Makes a section collapsible by adding a toggle button and content wrapper
 * @param {HTMLElement} section
 * @param {string} title
 * @param {boolean} [startOpen=true]
 * @param {string} [contentClass]
 */
function makeCollapsibleSection(sideBar, title, startOpen = true, contentClass = "") {
    const section = sideBar.createEl("section", { cls: "frontpage-live__section" });
    const header = section.createEl("div", { cls: "frontpage-live__section-header" });
    const h3 = header.createEl("h3", { cls: "frontpage-live__section-title frontpage-live__section-toggle", attr: { "aria-expanded": String(startOpen)}, text: title });

    const content = section.createEl("div", { cls: `frontpage-live__section-content is-collapsed ${contentClass}` });
    if (!startOpen) {
        content.classList.add("is-collapsed");
    }

    h3.addEventListener("click", () => {
        const isOpen = !content.classList.contains("is-collapsed");
        content.classList.toggle("is-collapsed");
        h3.setAttribute("aria-expanded", String(!isOpen));
    });

    return content;
}

/**
 * Makes the sidebar itself collapsible
 * @param {HTMLElement} sidebar
 * @param {boolean} [startOpen=true]
 */
function makeCollapsibleSidebar(sidebar, title, startOpen = true) {
    const header = sidebar.createEl("div", { cls: "frontpage-live__sidebar-header" });
    const h2 = sidebar.createEl("h2", { 
        cls: "frontpage-live__section-title frontpage-live__sidebar-toggle",
        attr: { "aria-expanded": String(startOpen) }, 
        text: title
    });

    // Create content wrapper for all sections (but not action buttons)
    const content = sidebar.createEl("div", { cls: "frontpage-live__sidebar-content" });
    if (!startOpen) {
        content.classList.add("is-collapsed");
    }

    // Add toggle event listener
    h2.addEventListener("click", () => {
        const isOpen = !content.classList.contains("is-collapsed");
        content.classList.toggle("is-collapsed");
        h2.setAttribute("aria-expanded", String(!isOpen));
    });

    return content;
}

/**
 * Renders the full front page (filters + recipe list) inside the js-engine container.
 *
 * @param {*} engine
 * @param {{ file: import("obsidian").TFile }} context
 * @param {HTMLElement} container
 * @param {import("obsidian").Component} component
 */
export async function setupFrontpageLive(engine, context, container, component) {
    const app = engine.app;
    const mb = engine.getPlugin("obsidian-meta-bind-plugin").api;
    const path = context.file.path;

    container.empty();
    container.classList.add("frontpage-live-root", "recipe-ui");

    const grid = container.createEl("div", { cls: "frontpage-live__grid" });
    const sidebar = grid.createEl("aside", { cls: "frontpage-live__sidebar is-collapsed" });
    const main = grid.createEl("div", { cls: "frontpage-live__main" });

    const sidebarTitle = sidebar.createEl("h3", { cls: "frontpage-live__sidebar-title", text: "Advanced search" });
    const sidebarContent = makeCollapsibleSidebar(sidebar, sidebarTitle, false);

    /** @type {any[]} */
    let appliedRecipes = [];

    const secRating = makeCollapsibleSection(sidebarContent, "Rating", false);
    mountSlider(mb, component, secRating, path, "filter_note_min", "Min rating", {
        min: 0,
        max: 5,
        step: 0.1,
    });
    mountSlider(mb, component, secRating, path, "filter_note_max", "Max rating", {
        min: 0,
        max: 5,
        step: 0.1,
    });

    const secDur = makeCollapsibleSection(sidebarContent, "Durations", false, "frontpage-live__duration-block");
    const readSec = (key) => {
        const bt = mb.parseBindTarget(key, path);
        const v = mb.getMetadata(bt);
        const n = Number(v);
        return Number.isFinite(n) ? n : DEFAULT_MAX_SEC;
    };
    for (const spec of [
        { field: "filter_prep_max_sec", label: "Max preparation" },
        { field: "filter_cook_max_sec", label: "Max cooking" },
        { field: "filter_rest_max_sec", label: "Max rest" },
    ]) {
        const durInput = new DurationInput(path, spec.field);
        durInput.label = spec.label;
        durInput.generate(mb, false, readSec(spec.field));
        applyMdrcLayoutSteps(
            mb,
            component,
            durInput.layoutMDRC(mb, secDur, false, durInput.lastValue ?? DEFAULT_MAX_SEC)
        );
    }

    const secTags = makeCollapsibleSection(sidebarContent, "Tags", false);
    secTags.createEl("p", {
        cls: "frontpage-live__hint",
        text: "Recipes must include every tag you pick here (empty = no tag filter).",
    });
    const tagsRow = secTags.createEl("div", { cls: UI_CLASSES.TAGS_CONTAINER });
    const tagsInput = new TagsInput(path, "filter_tags", false);
    tagsInput.generate(mb);
    tagsInput.render(mb).forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, tagsRow));

    const secSrc = makeCollapsibleSection(sidebarContent, "Source", false);
    mountText(mb, component, secSrc, path, "filter_source_substr", "Contains", "source contains…");

    const secIng = makeCollapsibleSection(sidebarContent, "Ingredients", false, "ingredient-filter-wrapper");

    const btnRow = sidebarContent.createEl("div", { cls: "frontpage-live__sidebar-actions" });
    const btnApply = btnRow.createEl("button", {
        cls: "mod-cta frontpage-live__btn-apply",
        text: "Apply advanced filters",
        type: "button",
    });
    const btnReset = btnRow.createEl("button", {
        cls: "frontpage-live__btn-reset",
        text: "Reset all advanced filters",
        type: "button",
    });

    main.createEl("h1", { cls: "frontpage-live__title", text: "Recipes" });
    const actions = main.createEl("div", { cls: "frontpage-live__actions" });
    const newRecipeDecl = {
        style: "primary",
        label: "New recipe",
        hidden: false,
        actions: [
            {
                type: "runTemplaterFile",
                templateFile: "source/templates/recipe.md",
            },
        ],
    };
    const newRecipeBtn = mb.createButtonMountable(path, {
        declaration: newRecipeDecl,
        isPreview: false,
    });
    const newRecipeMount = actions.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
    mb.wrapInMDRC(newRecipeBtn, newRecipeMount, component);

    main.createEl("h2", { cls: "frontpage-live__index-heading", text: "Recipe index" });
    const toolbar = main.createEl("div", { cls: "frontpage-live__toolbar" });
    toolbar.createEl("label", {
        cls: "frontpage-live__toolbar-label",
        attr: { for: "frontpage-recipe-name-filter" },
        text: "Recipe name",
    });
    const recipeNameInput = toolbar.createEl("input", {
        type: "text",
        cls: "frontpage-live__recipe-name-input",
        attr: {
            id: "frontpage-recipe-name-filter",
            placeholder: "Filter by recipe name…",
            spellcheck: "false",
            "aria-label": "Filter recipes by name",
        },
    });
    const countEl = toolbar.createEl("span", { cls: "frontpage-live__count" });
    const tableHost = main.createEl("div", { cls: "frontpage-live__table-host" });

    const ingredientFilter = new IngredientFilter(path);

    async function renderResultsTable() {
        tableHost.empty();
        const ingNeedle = ingredientFilter.searchInputEl?.value ?? "";
        const filtered = filterRecipesInstant(appliedRecipes, recipeNameInput.value, ingNeedle);
        countEl.textContent = `${filtered.length} / ${appliedRecipes.length}`;

        if (appliedRecipes.length === 0) {
            tableHost.createEl("p", {
                cls: "frontpage-live__empty",
                text: "No recipes match the advanced filters. Adjust filters and click “Apply advanced filters”.",
            });
            return;
        }
        if (filtered.length === 0) {
            tableHost.createEl("p", {
                cls: "frontpage-live__empty",
                text: "No recipes match the recipe name or ingredient text filter.",
            });
            return;
        }

        const table = tableHost.createEl("table", { cls: "frontpage-live__table" });
        const trh = table.createEl("thead").createEl("tr");
        trh.createEl("th", { text: "Recipe" });
        trh.createEl("th", { text: "Rating" });
        const tbody = table.createEl("tbody");
        for (const p of filtered) {
            const tr = tbody.createEl("tr");
            const tdName = tr.createEl("td", { cls: "frontpage-live__cell-name" });
            const tdRate = tr.createEl("td", { cls: "frontpage-live__cell-rating" });
            const file = p.file;
            const n = p.note;
            tdRate.textContent = Number.isFinite(Number(n)) ? String(n) : "—";
            mb.mb.internal.renderMarkdown(`[[${file.path}|${recipeDisplayName(p)}]]`, tdName, path);
        }
    }

    async function runAdvancedQuery() {
        appliedRecipes = await queryFilteredRecipes(app, mb, path);
        await renderResultsTable();
    }

    await ingredientFilter.mount(mb, component, secIng, {
        onSearchChange: () => {
            void renderResultsTable();
        },
    });

    recipeNameInput.addEventListener("input", () => {
        void renderResultsTable();
    });

    btnApply.addEventListener("click", () => {
        void runAdvancedQuery();
    });

    btnReset.addEventListener("click", () => {
        resetAdvancedFilters(mb, path);
        void ingredientFilter.refreshList(mb, component);
        void runAdvancedQuery();
    });

    attachFrontpageLiveSubscriptions(mb, component, path, () => ingredientFilter.refreshList(mb, component));

    await runAdvancedQuery();

    return null;
}
