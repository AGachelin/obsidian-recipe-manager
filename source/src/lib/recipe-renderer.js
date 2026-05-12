import { FRONTMATTER, FRONTMATTER_DEFAULTS, FRONTMATTER_LABELS } from "../shared/constants/recipe.js";
import { UI_CLASSES } from "../shared/constants/ui.js";
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
 * @param {Array<{ parent: HTMLElement, field?: unknown, spanText?: string, wrapperCls?: string }>} steps
 */
function applyMdrcLayoutSteps(mb, component, steps) {
    for (const step of steps) {
        if (step.field != null) {
            const mountEl =
                step.wrapperCls != null
                    ? step.parent.createEl("div", { cls: step.wrapperCls })
                    : step.parent.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
            mb.wrapInMDRC(step.field, mountEl, component);
        }
        if (step.spanText != null) {
            step.parent.createEl("span", { text: step.spanText });
        }
    }
}

/**
 * @param {unknown} mb
 * @param {import("obsidian").Component} component
 * @param {unknown} field
 * @param {HTMLElement} parent
 */
function wrapMdrcInDedicatedMount(mb, component, field, parent) {
    const mount = parent.createEl("span", { cls: UI_CLASSES.MDRC_MOUNT });
    mb.wrapInMDRC(field, mount, component);
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
        container.classList.add(UI_CLASSES.RECIPE_ROOT);

        this.generate(mb, view, metadata);

        const toggleContainer = container.createEl("div", { cls: UI_CLASSES.RECIPE_TOGGLE_BAR });
        this.toggleButton
            .render(mb, view)
            .forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, toggleContainer));

        const ingredientsContainer = container.createEl("div", { cls: UI_CLASSES.INGREDIENTS_CONTAINER });
        ingredientsContainer.createEl("h3", { text: "Ingredients" });
        const ingredients =
            this.metadata[FRONTMATTER.INGREDIENTS] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.INGREDIENTS];
        if (view) {
            this.ingredientViewTable.render(mb, ingredients).forEach((row) => {
                const rowEl = ingredientsContainer.createEl("div", { cls: UI_CLASSES.INGREDIENT_ROW });
                row.forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, rowEl));
            });
        } else {
            this.ingredientInputTable.render(mb, ingredients).forEach((row) => {
                const rowEl = ingredientsContainer.createEl("div", { cls: UI_CLASSES.INGREDIENT_ROW });
                applyMdrcLayoutSteps(mb, component, row.layoutSteps(rowEl));
            });
            const addButtonContainer = ingredientsContainer.createEl("div", {
                cls: UI_CLASSES.ADD_INGREDIENT_CONTAINER,
            });
            applyMdrcLayoutSteps(mb, component, this.addIngredientButton.layoutMDRC(mb, addButtonContainer));
        }

        const personContainer = container.createEl("div", { cls: UI_CLASSES.PERSON_CONTAINER });
        this.personButton
            .render(mb, view)
            .forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, personContainer));

        const sourceContainer = container.createEl("div", { cls: UI_CLASSES.SOURCE_CONTAINER });
        applyMdrcLayoutSteps(mb, component, this.sourceInput.layoutMDRC(view, sourceContainer, mb));

        const noteContainer = container.createEl("div", { cls: UI_CLASSES.NOTE_CONTAINER });
        applyMdrcLayoutSteps(
            mb,
            component,
            this.noteInput.layoutMDRC(
                mb,
                noteContainer,
                view,
                this.metadata[FRONTMATTER.NOTE] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.NOTE]
            )
        );

        const durationsContainer = container.createEl("div", { cls: UI_CLASSES.DURATIONS_CONTAINER });
        [this.cookDuration, this.restDuration, this.prepDuration].forEach((duration) => {
            const steps = duration.layoutMDRC(
                mb,
                durationsContainer,
                view,
                duration.lastValue ?? FRONTMATTER_DEFAULTS.DURATION
            );
            applyMdrcLayoutSteps(mb, component, steps);
        });

        const ovenContainer = container.createEl("div", { cls: UI_CLASSES.OVEN_CONTAINER });
        applyMdrcLayoutSteps(
            mb,
            component,
            this.ovenInput.layoutMDRC(
                mb,
                ovenContainer,
                view,
                this.metadata[FRONTMATTER.OVEN] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.OVEN]
            )
        );

        const contentContainer = container.createEl("div", { cls: UI_CLASSES.CONTENT_CONTAINER });
        this.content.render(view, mb.mb.internal, contentContainer);

        const tagsContainer = container.createEl("div", { cls: UI_CLASSES.TAGS_CONTAINER });
        this.tagsInput
            .render(mb)
            .forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, tagsContainer));
    }
}
