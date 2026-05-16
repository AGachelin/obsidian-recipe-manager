import { DurationInput } from "../../components/shared/duration-input.js";
import { IngredientFilter } from "../../components/frontpage-fields/ingredient-filter.js";
import { TagsInput } from "../../components/shared/tags-input.js";
import { UI_CLASSES } from "../../shared/constants/ui.js";
import { FRONTPAGE_DEFAULT_MAX_DURATION_SEC } from "../../shared/constants/frontpage.js";
import { applyMdrcLayoutSteps, wrapMdrcInDedicatedMount } from "../meta-bind-layout.js";
import { queryFilteredRecipes, filterRecipesInstant, recipeDisplayName } from "./query.js";
import { createCoalescedScheduler } from "../coalesced-refresh.js";
import { mountCollapsibleSection, mountCollapsibleSidebar } from "./collapsible.js";
import {
    mountSliderField,
    mountTextField,
    resetAdvancedFilterMetadata,
} from "./advanced-filter-fields.js";
import { ButtonConfig } from "../../components/config/button-config.js";

/**
 * @param {*} mb
 * @param {import("obsidian").Component} component
 * @param {string} path
 * @param {function} refreshIngredientRows
 */
function attachFrontpageLiveSubscriptions(mb, component, path, refreshIngredientRows) {
    const { schedule } = createCoalescedScheduler(refreshIngredientRows);
    const watch = (bindTarget) => mb.subscribeToMetadata(bindTarget, component, schedule);
    const at = (key) => mb.parseBindTarget(key, path);
    watch(at("filter_ingredients_state"));
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

    const sidebarContent = mountCollapsibleSidebar(sidebar, "Advanced search", false);

    /** @type {any[]} */
    let appliedRecipes = [];

    const secRating = mountCollapsibleSection(sidebarContent, "Rating", false);
    mountSliderField(mb, component, secRating, path, "filter_note_min", "Min rating", {
        min: 0,
        max: 5,
        step: 0.1,
    });
    mountSliderField(mb, component, secRating, path, "filter_note_max", "Max rating", {
        min: 0,
        max: 5,
        step: 0.1,
    });

    const secDur = mountCollapsibleSection(sidebarContent, "Durations", false, "frontpage-live__duration-block");
    const readSec = (key) => {
        const bt = mb.parseBindTarget(key, path);
        const v = mb.getMetadata(bt);
        const n = Number(v);
        return Number.isFinite(n) ? n : FRONTPAGE_DEFAULT_MAX_DURATION_SEC;
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
            durInput.layoutMDRC(mb, secDur, false, durInput.lastValue ?? FRONTPAGE_DEFAULT_MAX_DURATION_SEC)
        );
    }

    const secTags = mountCollapsibleSection(sidebarContent, "Tags", false);
    secTags.createEl("p", {
        cls: "frontpage-live__hint",
        text: "Recipes must include every tag you pick here (empty = no tag filter).",
    });
    const tagsRow = secTags.createEl("div", { cls: UI_CLASSES.TAGS_CONTAINER });
    const tagsInput = new TagsInput(path, "filter_tags", false);
    tagsInput.generate(mb);
    tagsInput.render(mb).forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, tagsRow));

    const secSrc = mountCollapsibleSection(sidebarContent, "Source", false);
    mountTextField(mb, component, secSrc, path, "filter_source_substr", "Contains", "source contains…");

    const secIng = mountCollapsibleSection(sidebarContent, "Ingredients", false, "ingredient-filter-wrapper");

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
    const newRecipeDecl = new ButtonConfig("new-recipe", "New recipe","", "primary");
    newRecipeDecl.addAction({
        type: "runTemplaterFile",
        templateFile: "source/templates/recipe.md"
    });
    const newRecipeBtn = mb.createButtonMountable(path, newRecipeDecl.render(false));
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
                text: 'No recipes match the advanced filters. Adjust filters and click "Apply advanced filters".',
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
        resetAdvancedFilterMetadata(mb, path);
        void ingredientFilter.refreshList(mb, component);
        void runAdvancedQuery();
    });

    attachFrontpageLiveSubscriptions(mb, component, path, () =>
        ingredientFilter.refreshList(mb, component)
    );

    await runAdvancedQuery();

    return null;
}
