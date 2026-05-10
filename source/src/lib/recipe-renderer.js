import { FRONTMATTER, FRONTMATTER_DEFAULTS } from "../shared/constants/recipe.js";
import { Content } from "../components/js/content.js";
import { DurationInput } from "../components/js/duration-input.js";
import { IngredientInputTable } from "../components/js/ingredient-input-table.js";
import { IngredientViewTable } from "../components/js/ingredients-view.js";
import { NoteInput } from "../components/js/note-input.js";
import { OvenInput } from "../components/js/oven-input.js";
import { PersonButton } from "../components/js/person-button.js";
import { SourceInput } from "../components/js/source-input.js";
import { TagsInput } from "../components/js/tags-input.js";
import { AddIngredientButton } from "../components/js/add-ingredient-button-group.js";
import { AddIngredientButton as ToggleButton } from "../components/js/toggle-button.js";

export class RecipeRenderer {
    constructor(path) {
        this.path = path;
        this.content = new Content(path);
        this.prepDuration = new DurationInput(path, `memory.${path}.prep_duration.hour`, `memory.${path}.prep_duration.min`, `memory.${path}.prep_duration.sec`, `memory.${path}.prep_duration`, FRONTMATTER.PREP_DURATION);
        this.cookDuration = new DurationInput(path, `memory.${path}.cook_duration.hour`, `memory.${path}.cook_duration.min`, `memory.${path}.cook_duration.sec`, `memory.${path}.cook_duration`, FRONTMATTER.COOK_DURATION);
        this.restDuration = new DurationInput(path, `memory.${path}.rest_duration.hour`, `memory.${path}.rest_duration.min`, `memory.${path}.rest_duration.sec`, `memory.${path}.rest_duration`, FRONTMATTER.REST_DURATION);
        this.ingredientInputTable = new IngredientInputTable(path);
        this.ingredientViewTable = new IngredientViewTable(path);
        this.noteInput = new NoteInput(FRONTMATTER.NOTE, path);
        this.ovenInput = new OvenInput(FRONTMATTER.OVEN, path);
        this.personButton = new PersonButton(path, FRONTMATTER.PERSON.LABEL, FRONTMATTER_DEFAULTS[FRONTMATTER.PERSON.RAW]);
        this.sourceInput = new SourceInput(FRONTMATTER.SOURCE, path);
        this.tagsInput = new TagsInput(FRONTMATTER.TAGS, path);
        this.addIngredientButton = new AddIngredientButton(path);
        this.toggleButton = new ToggleButton(path);
        this.isGenerated = false;
    }

    generate(mb, view, metadata) {
        this.isGenerated = true;
        this.mb = mb;
        this.view = view;
        this.metadata = metadata;
        // Generate all components
        this.content.generate(mb, view);
        this.prepDuration.generate(mb, view, metadata[FRONTMATTER.PREP_DURATION] || FRONTMATTER_DEFAULTS.DURATION);
        this.cookDuration.generate(mb, view, metadata[FRONTMATTER.COOK_DURATION] || FRONTMATTER_DEFAULTS.DURATION);
        this.restDuration.generate(mb, view, metadata[FRONTMATTER.REST_DURATION] || FRONTMATTER_DEFAULTS.DURATION);
        this.ingredientInputTable.generate(mb, metadata[FRONTMATTER.INGREDIENTS] || FRONTMATTER_DEFAULTS[FRONTMATTER.INGREDIENTS]);
        this.ingredientViewTable.generate(mb, metadata[FRONTMATTER.INGREDIENTS] || FRONTMATTER_DEFAULTS[FRONTMATTER.INGREDIENTS]);
        this.noteInput.generate(mb, view, metadata[FRONTMATTER.NOTE]);
        this.ovenInput.generate(mb, view, metadata[FRONTMATTER.OVEN]);
        this.personButton.generate(mb);
        this.sourceInput.generate(mb, view, metadata[FRONTMATTER.SOURCE]);
        this.tagsInput.generate(mb);
        this.addIngredientButton.generate(mb);
        this.toggleButton.generate(mb, view);
    }

    render(mb, container, component, view, metadata) {
        if (!this.isGenerated || this.view !== view || this.metadata !== metadata) {
            this.generate(mb, view, metadata);
        }

        // Clear container
        container.empty();

        // Render toggle button
        const toggleContainer = container.createEl('div', { cls: 'toggle-container' });
        this.toggleButton.render(mb, view).forEach(field => mb.wrapInMDRC(field, toggleContainer, component));

        // Render ingredients
        const ingredientsContainer = container.createEl('div', { cls: 'ingredients-container' });
        ingredientsContainer.createEl('h3', { text: 'Ingredients' });
        if (view) {
            this.ingredientViewTable.render(mb, metadata[FRONTMATTER.INGREDIENTS]).forEach(row => row.forEach(field => mb.wrapInMDRC(field, ingredientsContainer, component)));
        } else {
            this.ingredientInputTable.render(mb, metadata[FRONTMATTER.INGREDIENTS]).forEach(row => row.forEach(field => mb.wrapInMDRC(field, ingredientsContainer, component)));
            const addButtonContainer = ingredientsContainer.createEl('div', { cls: 'add-ingredient-container' });
            this.addIngredientButton.render(mb, addButtonContainer, component);
        }

        // Render person button
        const personContainer = container.createEl('div', { cls: 'person-container' });
        const result = this.personButton.render(mb);
        console.log(result);
        result.forEach(field => mb.wrapInMDRC(field, personContainer, component));

        // Render durations
        const durationsContainer = container.createEl('div', { cls: 'durations-container' });
        [this.prepDuration, this.cookDuration, this.restDuration].forEach(duration => {
            duration.render(mb, durationsContainer, component, view);
        });

        // Render oven
        const ovenContainer = container.createEl('div', { cls: 'oven-container' });
        this.ovenInput.render(mb, ovenContainer, component, view);

        // Render note
        const noteContainer = container.createEl('div', { cls: 'note-container' });
        this.noteInput.render(mb, view).forEach(field => mb.wrapInMDRC(field, noteContainer, component));

        // Render content
        const contentContainer = container.createEl('div', { cls: 'content-container' });
        this.content.render(view, mb.mb.internal, contentContainer);

        // Render source
        const sourceContainer = container.createEl('div', { cls: 'source-container' });
        this.sourceInput.render(view, sourceContainer, mb, component);

        // Render tags
        const tagsContainer = container.createEl('div', { cls: 'tags-container' });
        this.tagsInput.render(mb).forEach(field => mb.wrapInMDRC(field, tagsContainer, component));
    }
}