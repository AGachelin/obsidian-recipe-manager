/**
 * Recipe index page renderer — analogous to `RecipeRenderer` in `recipe/recipe-renderer.js`: parts are wired in the
 * `constructor`, Meta Bind mounts in `generate`, and `render` + `#mount*` place everything on the DOM.
 *
 * Unlike single-recipe preview, `render` is async (ingredient corpus + filtered query pipeline).
 */
import { createFrontpageChrome } from "../../components/frontpage/frontpage-layout-shell.js";
import { FrontpageAdvancedSidebar } from "../../components/frontpage/frontpage-advanced-sidebar.js";
import { FrontpageRecipeIndexChrome } from "../../components/frontpage/frontpage-index-main.js";
import { FrontpageRecipeResultsPanel } from "../../components/frontpage/frontpage-results-panel.js";
import { resetAdvancedFilterMetadata } from "../../components/frontpage/filter-field-mounts.js";
import { FRONTPAGE_LIVE_SUBSCRIPTION_KEYS } from "../../shared/constants/frontpage.js";
import { subscribeToFrontmatterKeys } from "../render/subscribe-metadata.js";
import { createCoalescedScheduler } from "../coalesced-refresh.js";

export class FrontpageRenderer {
    constructor(path) {
        this.path = path;
        this.sidebar = new FrontpageAdvancedSidebar(this.path);
        this.indexChrome = new FrontpageRecipeIndexChrome(this.path);
        this.results = new FrontpageRecipeResultsPanel(this.path);
    }

    /** @param {*} mb */
    generate(mb) {
        this.sidebar.generate(mb);
    }

    /**
     * @param {*} engine
     * @param {{ file: import("obsidian").TFile }} context
     * @param {HTMLElement} container
     * @param {import("obsidian").Component} component
     * @returns {Promise<null>}
     */
    async render(engine, context, container, component) {
        const mb = engine.getPlugin("obsidian-meta-bind-plugin").api;
        const app = engine.app;

        this.generate(mb);

        const { sidebarContent, main } = createFrontpageChrome(container);

        const { btnApply, btnReset } = await this.#mountAdvancedSidebar(mb, sidebarContent, component);

        const mainRefs = this.#mountRecipeIndex(mb, main, component);

        this.results.attachDom(mainRefs);
        this.results.setIngredientNeedleSupplier(
            () => this.sidebar.ingredientFilter.searchInputEl?.value ?? ""
        );

        mainRefs.recipeNameInput.addEventListener("input", () => {
            void this.results.paint(mb);
        });

        btnApply.addEventListener("click", () => {
            void this.results.runAdvancedQuery(mb, app);
        });

        btnReset.addEventListener("click", () => {
            resetAdvancedFilterMetadata(mb, this.path);
            void this.sidebar.ingredientFilter.reloadIngredientNames(mb);
            void this.sidebar.ingredientFilter.refreshList(mb, component);
            void this.results.runAdvancedQuery(mb, app);
        });

        const { schedule: scheduleIngredientListRefresh } = createCoalescedScheduler(() => {
            void this.sidebar.ingredientFilter.refreshList(mb, component);
        });
        this.#attachFrontpageSubscriptions(mb, component, scheduleIngredientListRefresh);

        await this.results.runAdvancedQuery(mb, app);
        return null;
    }

    /**
     * @param {*} mb
     * @param {HTMLElement} sidebarContent
     * @param {import("obsidian").Component} component
     */
    async #mountAdvancedSidebar(mb, sidebarContent, component) {
        return this.sidebar.mount(sidebarContent, mb, component, {
            onSearchChange: () => {
                void this.results.paint(mb);
            },
        });
    }

    /**
     * @param {*} mb
     * @param {HTMLElement} mainEl
     * @param {import("obsidian").Component} component
     */
    #mountRecipeIndex(mb, mainEl, component) {
        return this.indexChrome.mount(mainEl, mb, component);
    }

    /**
     * @param {*} mb
     * @param {import("obsidian").Component} component
     * @param {() => void} onRefresh
     */
    #attachFrontpageSubscriptions(mb, component, onRefresh) {
        subscribeToFrontmatterKeys(mb, component, this.path, FRONTPAGE_LIVE_SUBSCRIPTION_KEYS, onRefresh);
    }
}
