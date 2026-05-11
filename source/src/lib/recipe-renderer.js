import { FRONTMATTER, FRONTMATTER_DEFAULTS, FRONTMATTER_LABELS } from "../shared/constants/recipe.js";
import { Content } from "../components/content.js";
import { DurationInput } from "../components/field-components/duration-input.js";
import { IngredientInputTable } from "../components/field-components/ingredient-input-table.js";
import { IngredientViewTable } from "../components/field-components/ingredients-view.js";
import { NoteInput } from "../components/note-input.js";
import { OvenInput } from "../components/oven-input.js";
import { PersonButton } from "../components/person-button.js";
import { SourceInput } from "../components/source-input.js";
import { TagsInput } from "../components/tags-input.js";
import { AddIngredientButton } from "../components/add-ingredient-button-group.js";
import { ToggleButton } from "../components/toggle-button.js";

/**
 * @param {unknown} mb
 * @param {import("obsidian").Component} component
 * @param {Array<{ parent: HTMLElement, field?: unknown, spanText?: string }>} steps
 */
function applyMdrcLayoutSteps(mb, component, steps) {
    for (const step of steps) {
        if (step.field != null) {
            mb.wrapInMDRC(step.field, step.parent, component);
        }
        if (step.spanText != null) {
            step.parent.createEl("span", { text: step.spanText });
        }
    }
}

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
        this.isGenerated = false;
        this.uiComponentAttached = false;
    }

    generate(mb, view, metadata) {
        this.isGenerated = true;
        this.mb = mb;
        this.view = view;
        this.metadata = metadata ?? {};

        this.prepDuration.label = FRONTMATTER_LABELS.PREP;
        this.cookDuration.label = FRONTMATTER_LABELS.COOK;
        this.restDuration.label = FRONTMATTER_LABELS.REST;

        const prepSec = Number(this.metadata[FRONTMATTER.PREP_DURATION]) || 0;
        const cookSec = Number(this.metadata[FRONTMATTER.COOK_DURATION]) || 0;
        const restSec = Number(this.metadata[FRONTMATTER.REST_DURATION]) || 0;

        this.content.generate(mb, view);
        const noteValue =
            this.metadata[FRONTMATTER.NOTE] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.NOTE];
        const ovenValue =
            this.metadata[FRONTMATTER.OVEN] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.OVEN];
        const sourceValue =
            this.metadata[FRONTMATTER.SOURCE] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.SOURCE];

        this.prepDuration.generate(mb, view, prepSec);
        this.cookDuration.generate(mb, view, cookSec);
        this.restDuration.generate(mb, view, restSec);

        const ingredientsValue =
            this.metadata[FRONTMATTER.INGREDIENTS] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.INGREDIENTS];
        this.ingredientInputTable.generate(mb, ingredientsValue);
        this.ingredientViewTable.generate(mb, ingredientsValue);
        this.noteInput.generate(mb, view, noteValue);
        this.ovenInput.generate(mb, view, ovenValue);
        this.personButton.generate(mb);
        this.sourceInput.generate(mb, view, sourceValue);
        this.tagsInput.generate(mb);
        this.addIngredientButton.generate(mb);
        this.toggleButton.generate(mb, view);
    }

    render(mb, container, component, view, metadata) {
        container.empty();

        this.generate(mb, view, metadata);

        const toggleContainer = container.createEl("div");
        this.toggleButton.render(mb, view).forEach((field) => mb.wrapInMDRC(field, toggleContainer, component));

        const ingredientsContainer = container.createEl("div", { cls: "ingredients-container" });
        ingredientsContainer.createEl("h3", { text: "Ingredients" });
        const ingredients =
            this.metadata[FRONTMATTER.INGREDIENTS] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.INGREDIENTS];
        if (view) {
            this.ingredientViewTable.render(mb, ingredients).forEach((row) => {
                const rowEl = ingredientsContainer.createEl("div", { cls: "ingredient-row" });
                row.forEach((field) => mb.wrapInMDRC(field, rowEl, component));
            });
        } else {
            this.ingredientInputTable.render(mb, ingredients).forEach((row) => {
                const rowEl = ingredientsContainer.createEl("div", { cls: "ingredient-row" });
                row.forEach((field) => mb.wrapInMDRC(field, rowEl, component));
            });
            const addButtonContainer = ingredientsContainer.createEl("div", { cls: "add-ingredient-container" });
            applyMdrcLayoutSteps(mb, component, this.addIngredientButton.layoutMdrc(mb, addButtonContainer));
        }

        const personContainer = container.createEl("div", { cls: "person-container" });
        this.personButton.render(mb, view).forEach((field) => mb.wrapInMDRC(field, personContainer, component));

        const sourceContainer = container.createEl("div", { cls: "source-container" });
        applyMdrcLayoutSteps(mb, component, this.sourceInput.layoutMdrc(view, sourceContainer, mb));

        const noteContainer = container.createEl("div", { cls: "note-container" });
        this.noteInput.render(mb, view).forEach((field) => mb.wrapInMDRC(field, noteContainer, component));

        const durationsContainer = container.createEl("div", { cls: "durations-container" });
        [this.cookDuration, this.restDuration, this.prepDuration].forEach((duration) => {
            const steps = duration.layoutMdrc(
                mb,
                durationsContainer,
                view,
                duration.lastValue ?? FRONTMATTER_DEFAULTS.DURATION
            );
            applyMdrcLayoutSteps(mb, component, steps);
        });

        const ovenContainer = container.createEl("div", { cls: "oven-container" });
        applyMdrcLayoutSteps(
            mb,
            component,
            this.ovenInput.layoutMdrc(
                mb,
                ovenContainer,
                view,
                this.metadata[FRONTMATTER.OVEN] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.OVEN]
            )
        );

        const contentContainer = container.createEl("div", { cls: "content-container" });
        this.content.render(view, mb.mb.internal, contentContainer);

        const tagsContainer = container.createEl("div", { cls: "tags-container" });
        this.tagsInput.render(mb).forEach((field) => mb.wrapInMDRC(field, tagsContainer, component));
    }
}
