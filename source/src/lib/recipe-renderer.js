import { FRONTMATTER, FRONTMATTER_DEFAULTS } from "../shared/constants/recipe.js";
import { UI_CLASSES, UI_LABELS } from "../shared/constants/ui.js";
import { Content } from "../components/content.js";
import { DurationInput } from "../components/recipe-fields/duration-input.js";
import { IngredientInputTable } from "../components/recipe-fields/ingredient-input-table.js";
import { IngredientViewTable } from "../components/recipe-fields/ingredients-view.js";
import { NoteInput } from "../components/note-input.js";
import { OvenInput } from "../components/oven-input.js";
import { PersonButton } from "../components/person-button.js";
import { SourceInput } from "../components/source-input.js";
import { TagsInput } from "../components/tags-input.js";
import { AddIngredientButton } from "../components/add-ingredient-button-group.js";
import { ToggleButton } from "../components/toggle-button.js";
import { applyMdrcLayoutSteps, wrapMdrcInDedicatedMount } from "./meta-bind-layout.js";
import { assignDurationLabels, buildRecipeBindSnapshot } from "./recipe-bind-sync.js";

export class RecipeRenderer {
    constructor(path) {
        this.path = path;
        this.content = new Content(path);
        this.prepDuration = new DurationInput(path, FRONTMATTER.PREP_DURATION);
        this.cookDuration = new DurationInput(path, FRONTMATTER.COOK_DURATION);
        this.restDuration = new DurationInput(path, FRONTMATTER.REST_DURATION);
        this.ingredientInputTable = new IngredientInputTable(path);
        this.ingredientViewTable = new IngredientViewTable(path);
        this.noteInput = new NoteInput(path);
        this.ovenInput = new OvenInput(path);
        this.personButton = new PersonButton(path, FRONTMATTER_DEFAULTS[FRONTMATTER.PERSON.RAW]);
        this.sourceInput = new SourceInput(path);
        this.tagsInput = new TagsInput(path);
        this.addIngredientButton = new AddIngredientButton(path);
        this.toggleButton = new ToggleButton(path);
        /** @type {Record<string, unknown>} */
        this.metadata = {};
    }

    /**
     * Rebuild Meta Bind mountables from frontmatter-driven state.
     * @param {unknown} mb
     * @param {boolean} view
     * @param {Record<string, unknown>} [metadata]
     */
    generate(mb, view, metadata) {
        this.mb = mb;
        this.view = view;
        this.metadata = metadata ?? {};

        assignDurationLabels(this);
        const snap = buildRecipeBindSnapshot(this.metadata);

        this.content.generate(mb, view);

        this.prepDuration.generate(mb, view, snap.prepSec);
        this.cookDuration.generate(mb, view, snap.cookSec);
        this.restDuration.generate(mb, view, snap.restSec);

        this.ingredientInputTable.generate(mb, snap.ingredientsValue);
        this.ingredientViewTable.generate(mb, snap.ingredientsValue);
        this.noteInput.generate(mb, view, snap.noteValue);
        this.ovenInput.generate(mb, view, snap.ovenValue);
        this.personButton.generate(mb);
        this.sourceInput.generate(mb, view, snap.sourceValue);
        this.tagsInput.generate(mb);
        this.addIngredientButton.generate(mb);
        this.toggleButton.generate(mb, view);
    }

    /**
     * @param {unknown} mb
     * @param {HTMLElement} container
     * @param {import("obsidian").Component} component
     * @param {boolean} view
     * @param {Record<string, unknown>} [metadata]
     */
    render(mb, container, component, view, metadata) {
        container.empty();
        container.classList.add(UI_CLASSES.RECIPE_ROOT);

        this.generate(mb, view, metadata);

        this._mountToggleBar(mb, component, container, view);

        const ingredients =
            this.metadata[FRONTMATTER.INGREDIENTS] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.INGREDIENTS];
        this._mountIngredients(mb, component, container, view, ingredients);

        this._mountPersonBar(mb, component, container, view);
        this._mountSource(mb, component, container, view);
        this._mountNote(mb, component, container, view);
        this._mountDurations(mb, component, container, view);
        this._mountOven(mb, component, container, view);

        const contentContainer = container.createEl("div", { cls: UI_CLASSES.CONTENT_CONTAINER });
        this.content.render(view, mb.mb.internal, contentContainer);

        const tagsContainer = container.createEl("div", { cls: UI_CLASSES.TAGS_CONTAINER });
        this.tagsInput
            .render(mb)
            .forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, tagsContainer));
    }

    _mountToggleBar(mb, component, container, view) {
        const el = container.createEl("div", { cls: UI_CLASSES.RECIPE_TOGGLE_BAR });
        this.toggleButton
            .render(mb, view)
            .forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, el));
    }

    _mountIngredients(mb, component, container, view, ingredients) {
        const section = container.createEl("div", { cls: UI_CLASSES.INGREDIENTS_CONTAINER });
        section.createEl("h3", { text: UI_LABELS.INGREDIENTS });

        if (view) {
            this.ingredientViewTable.render(mb, ingredients).forEach((row) => {
                const rowEl = section.createEl("div", { cls: UI_CLASSES.INGREDIENT_ROW });
                row.forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, rowEl));
            });
            return;
        }

        this.ingredientInputTable.render(mb, ingredients).forEach((row) => {
            const rowEl = section.createEl("div", { cls: UI_CLASSES.INGREDIENT_ROW });
            applyMdrcLayoutSteps(mb, component, row.layoutSteps(rowEl));
        });
        const addRow = section.createEl("div", { cls: UI_CLASSES.ADD_INGREDIENT_CONTAINER });
        applyMdrcLayoutSteps(mb, component, this.addIngredientButton.layoutMDRC(mb, addRow));
    }

    _mountPersonBar(mb, component, container, view) {
        const el = container.createEl("div", { cls: UI_CLASSES.PERSON_CONTAINER });
        this.personButton
            .render(mb, view)
            .forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, el));
    }

    _mountSource(mb, component, container, view) {
        const el = container.createEl("div", { cls: UI_CLASSES.SOURCE_CONTAINER });
        applyMdrcLayoutSteps(mb, component, this.sourceInput.layoutMDRC(mb, el, view));
    }

    _mountNote(mb, component, container, view) {
        const el = container.createEl("div", { cls: UI_CLASSES.NOTE_CONTAINER });
        applyMdrcLayoutSteps(
            mb,
            component,
            this.noteInput.layoutMDRC(
                mb,
                el,
                view,
                this.metadata[FRONTMATTER.NOTE] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.NOTE]
            )
        );
    }

    _mountDurations(mb, component, container, view) {
        const el = container.createEl("div", { cls: UI_CLASSES.DURATIONS_CONTAINER });
        const defaultSec = FRONTMATTER_DEFAULTS.DURATION;
        for (const duration of [this.cookDuration, this.restDuration, this.prepDuration]) {
            const steps = duration.layoutMDRC(mb, el, view, duration.lastValue ?? defaultSec);
            applyMdrcLayoutSteps(mb, component, steps);
        }
    }

    _mountOven(mb, component, container, view) {
        const el = container.createEl("div", { cls: UI_CLASSES.OVEN_CONTAINER });
        applyMdrcLayoutSteps(
            mb,
            component,
            this.ovenInput.layoutMDRC(
                mb,
                el,
                view,
                this.metadata[FRONTMATTER.OVEN] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.OVEN]
            )
        );
    }
}
