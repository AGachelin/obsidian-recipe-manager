/**
 * Recipe index page layout — symmetric role to `RecipeRenderer` in `recipe-renderer.js`
 * (DOM shell + Meta Bind mounting).
 */
import { DurationInput } from "../../components/shared/duration-input.js";
import { IngredientFilter } from "../../components/frontpage-fields/ingredient-filter.js";
import { TagsInput } from "../../components/shared/tags-input.js";
import { ButtonConfig } from "../../components/config/button-config.js";
import { UI_CLASSES } from "../../shared/constants/ui.js";
import {
    FrontpageFm,
    FRONTPAGE_DEFAULT_MAX_DURATION_SEC,
    FRONTPAGE_LIVE_SUBSCRIPTION_KEYS,
} from "../../shared/constants/frontpage.js";
import { FRONTPAGE_LAYOUT } from "../../shared/constants/frontpage-ui.js";
import { applyMdrcLayoutSteps, wrapMdrcInDedicatedMount } from "../meta-bind-layout.js";
import { queryFilteredRecipes, filterRecipesInstant, recipeDisplayName } from "./query.js";
import { createCoalescedScheduler } from "../coalesced-refresh.js";
import { mountCollapsibleSection, mountCollapsibleSidebar } from "./collapsible-sections.js";
import {
    mountSliderField,
    mountTextField,
    resetAdvancedFilterMetadata,
} from "./advanced-filter-fields.js";

export class FrontpageRenderer {
    /**
     * @param {string} notePath Vault path of the front page note (filters + widget state live here).
     */
    constructor(notePath) {
        this.notePath = notePath;
    }

    /**
     * Builds layout and wires queries. Not reactive — refreshes on explicit actions / subscriptions.
     *
     * @param {*} engine
     * @param {{ file: import("obsidian").TFile }} context
     * @param {HTMLElement} container
     * @param {import("obsidian").Component} component
     * @returns {Promise<null>}
     */
    async mount(engine, context, container, component) {
        const app = engine.app;
        const mb = engine.getPlugin("obsidian-meta-bind-plugin").api;
        const path = this.notePath;

        container.empty();
        container.classList.add(FRONTPAGE_LAYOUT.root, UI_CLASSES.RECIPE_UI);

        const grid = container.createEl("div", { cls: FRONTPAGE_LAYOUT.grid });
        const sidebar = grid.createEl("aside", {
            cls: `${FRONTPAGE_LAYOUT.sidebar} is-collapsed`,
        });
        const main = grid.createEl("div", { cls: FRONTPAGE_LAYOUT.main });

        const sidebarContent = mountCollapsibleSidebar(sidebar, "Advanced search", false);

        /** @type {any[]} */
        let appliedRecipes = [];

        const secRating = mountCollapsibleSection(sidebarContent, "Rating", false);
        mountSliderField(mb, component, secRating, path, FrontpageFm.FILTER_NOTE_MIN, "Min rating", {
            min: 0,
            max: 5,
            step: 0.1,
        });
        mountSliderField(mb, component, secRating, path, FrontpageFm.FILTER_NOTE_MAX, "Max rating", {
            min: 0,
            max: 5,
            step: 0.1,
        });

        const secDur = mountCollapsibleSection(
            sidebarContent,
            "Durations",
            false,
            FRONTPAGE_LAYOUT.durationBlock
        );
        const readSec = (fmKey) => {
            const bt = mb.parseBindTarget(fmKey, path);
            const v = mb.getMetadata(bt);
            const n = Number(v);
            return Number.isFinite(n) ? n : FRONTPAGE_DEFAULT_MAX_DURATION_SEC;
        };
        for (const spec of [
            { field: FrontpageFm.FILTER_PREP_MAX_SEC, label: "Max preparation" },
            { field: FrontpageFm.FILTER_COOK_MAX_SEC, label: "Max cooking" },
            { field: FrontpageFm.FILTER_REST_MAX_SEC, label: "Max rest" },
        ]) {
            const durInput = new DurationInput(path, spec.field);
            durInput.label = spec.label;
            durInput.generate(mb, false, readSec(spec.field));
            applyMdrcLayoutSteps(
                mb,
                component,
                durInput.layoutMDRC(
                    mb,
                    secDur,
                    false,
                    durInput.lastValue ?? FRONTPAGE_DEFAULT_MAX_DURATION_SEC
                )
            );
        }

        const secTags = mountCollapsibleSection(sidebarContent, "Tags", false);
        secTags.createEl("p", {
            cls: FRONTPAGE_LAYOUT.hint,
            text: "Recipes must include every tag you pick here (empty = no tag filter).",
        });
        const tagsRow = secTags.createEl("div", { cls: UI_CLASSES.TAGS_CONTAINER });
        const tagsInput = new TagsInput(path, FrontpageFm.FILTER_TAGS, false);
        tagsInput.generate(mb);
        tagsInput
            .render(mb)
            .forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, tagsRow));

        const secSrc = mountCollapsibleSection(sidebarContent, "Source", false);
        mountTextField(
            mb,
            component,
            secSrc,
            path,
            FrontpageFm.FILTER_SOURCE_SUBSTR,
            "Contains",
            "source contains…"
        );

        const secIng = mountCollapsibleSection(
            sidebarContent,
            "Ingredients",
            false,
            FRONTPAGE_LAYOUT.ingredientSection
        );

        const btnRow = sidebarContent.createEl("div", { cls: FRONTPAGE_LAYOUT.sidebarActions });
        const btnApply = btnRow.createEl("button", {
            cls: FRONTPAGE_LAYOUT.btnApply,
            text: "Apply advanced filters",
            type: "button",
        });
        const btnReset = btnRow.createEl("button", {
            cls: FRONTPAGE_LAYOUT.btnReset,
            text: "Reset all advanced filters",
            type: "button",
        });

        main.createEl("h1", { cls: FRONTPAGE_LAYOUT.pageTitle, text: "Recipes" });
        const actions = main.createEl("div", { cls: FRONTPAGE_LAYOUT.actions });
        const newRecipeBtnCfg = new ButtonConfig("new-recipe", "New recipe", null, "primary");
        newRecipeBtnCfg.addAction({
            type: "runTemplaterFile",
            templateFile: "source/templates/recipe.md",
        });
        const newRecipeBtn = mb.createButtonMountable(path, newRecipeBtnCfg.render(false));
        const newRecipeMount = actions.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
        mb.wrapInMDRC(newRecipeBtn, newRecipeMount, component);

        main.createEl("h2", { cls: FRONTPAGE_LAYOUT.indexHeading, text: "Recipe index" });
        const toolbar = main.createEl("div", { cls: FRONTPAGE_LAYOUT.toolbar });
        toolbar.createEl("label", {
            cls: FRONTPAGE_LAYOUT.toolbarLabel,
            attr: { for: "frontpage-recipe-name-filter" },
            text: "Recipe name",
        });
        const recipeNameInput = toolbar.createEl("input", {
            type: "text",
            cls: FRONTPAGE_LAYOUT.recipeNameInput,
            attr: {
                id: "frontpage-recipe-name-filter",
                placeholder: "Filter by recipe name…",
                spellcheck: "false",
                "aria-label": "Filter recipes by name",
            },
        });
        const countEl = toolbar.createEl("span", { cls: FRONTPAGE_LAYOUT.count });
        const tableHost = main.createEl("div", { cls: FRONTPAGE_LAYOUT.tableHost });

        const ingredientFilter = new IngredientFilter(path);

        const renderResultsTable = async () => {
            tableHost.empty();
            const ingNeedle = ingredientFilter.searchInputEl?.value ?? "";
            const filtered = filterRecipesInstant(appliedRecipes, recipeNameInput.value, ingNeedle);
            countEl.textContent = `${filtered.length} / ${appliedRecipes.length}`;

            if (appliedRecipes.length === 0) {
                tableHost.createEl("p", {
                    cls: FRONTPAGE_LAYOUT.empty,
                    text: 'No recipes match the advanced filters. Adjust filters and click "Apply advanced filters".',
                });
                return;
            }
            if (filtered.length === 0) {
                tableHost.createEl("p", {
                    cls: FRONTPAGE_LAYOUT.empty,
                    text: "No recipes match the recipe name or ingredient text filter.",
                });
                return;
            }

            const table = tableHost.createEl("table", { cls: FRONTPAGE_LAYOUT.table });
            const trh = table.createEl("thead").createEl("tr");
            trh.createEl("th", { text: "Recipe" });
            trh.createEl("th", { text: "Rating" });
            const tbody = table.createEl("tbody");
            for (const p of filtered) {
                const tr = tbody.createEl("tr");
                const tdName = tr.createEl("td", { cls: FRONTPAGE_LAYOUT.cellName });
                const tdRate = tr.createEl("td", { cls: FRONTPAGE_LAYOUT.cellRating });
                const file = p.file;
                const n = p.note;
                tdRate.textContent = Number.isFinite(Number(n)) ? String(n) : "—";
                mb.mb.internal.renderMarkdown(`[[${file.path}|${recipeDisplayName(p)}]]`, tdName, path);
            }
        };

        const runAdvancedQuery = async () => {
            appliedRecipes = await queryFilteredRecipes(app, mb, path);
            await renderResultsTable();
        };

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

        this.#attachFilterSubscriptions(mb, component, path, () =>
            ingredientFilter.refreshList(mb, component)
        );

        await runAdvancedQuery();

        return null;
    }

    /**
     * @param {*} mb
     * @param {import("obsidian").Component} component
     * @param {string} path
     * @param {() => void} onRefresh
     */
    #attachFilterSubscriptions(mb, component, path, onRefresh) {
        const { schedule } = createCoalescedScheduler(onRefresh);
        const watch = (bindTarget) => mb.subscribeToMetadata(bindTarget, component, schedule);
        const at = (key) => mb.parseBindTarget(key, path);
        for (const key of FRONTPAGE_LIVE_SUBSCRIPTION_KEYS) {
            watch(at(key));
        }
    }
}
