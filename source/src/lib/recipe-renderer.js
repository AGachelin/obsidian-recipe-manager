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
        this.metadata = metadata;
        
        this.prepDuration.label = FRONTMATTER_LABELS.PREP;
        this.cookDuration.label = FRONTMATTER_LABELS.COOK;
        this.restDuration.label = FRONTMATTER_LABELS.REST;
        
        this.content.generate(mb, view);
        const prepSec =
            metadata[FRONTMATTER.PREP_DURATION] ?? metadata[FRONTMATTER.LEGACY_PREP] ?? FRONTMATTER_DEFAULTS.DURATION;
        const cookSec =
            metadata[FRONTMATTER.COOK_DURATION] ?? metadata[FRONTMATTER.LEGACY_COOK] ?? FRONTMATTER_DEFAULTS.DURATION;
        const restSec =
            metadata[FRONTMATTER.REST_DURATION] ?? metadata[FRONTMATTER.LEGACY_REST] ?? FRONTMATTER_DEFAULTS.DURATION;
        this.prepDuration.generate(mb, view, prepSec);
        this.cookDuration.generate(mb, view, cookSec);
        this.restDuration.generate(mb, view, restSec);
        this.durationSecondsByField = Object.freeze({
            prep_duration: prepSec,
            cook_duration: cookSec,
            rest_duration: restSec,
        });
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
        component.unload();
        component.load();
        container.empty();

        this.generate(mb, view, metadata);
        
        const toggleContainer = container.createEl('div');
        this.toggleButton.render(mb, view).forEach(field => mb.wrapInMDRC(field, toggleContainer, component));

        const ingredientsContainer = container.createEl('div', { cls: 'ingredients-container' });
        ingredientsContainer.createEl('h3', { text: 'Ingredients' });
        const fmIngredients = metadata?.[FRONTMATTER.INGREDIENTS];
        const ingredients =
            fmIngredients !== undefined && fmIngredients !== null ? fmIngredients : FRONTMATTER_DEFAULTS[FRONTMATTER.INGREDIENTS];
        if (view) {
            this.ingredientViewTable.render(mb, ingredients).forEach(row => row.forEach(field => mb.wrapInMDRC(field, ingredientsContainer, component)));
        } else {
            this.ingredientInputTable.render(mb, ingredients).forEach(row => row.forEach(field => mb.wrapInMDRC(field, ingredientsContainer, component)));
            const addButtonContainer = ingredientsContainer.createEl('div', { cls: 'add-ingredient-container' });
            this.addIngredientButton.render(mb, addButtonContainer, component);
        }

        const personContainer = container.createEl('div', { cls: 'person-container' });
        this.personButton.render(mb).forEach(field => mb.wrapInMDRC(field, personContainer, component));

        const durationsContainer = container.createEl('div', { cls: 'durations-container' });
        [this.prepDuration, this.cookDuration, this.restDuration].forEach(duration => {
            duration.render(
                mb,
                durationsContainer,
                component,
                view,
                this.durationSecondsByField[duration.durationField] ?? FRONTMATTER_DEFAULTS.DURATION
            );
        });

        const ovenContainer = container.createEl('div', { cls: 'oven-container' });
        this.ovenInput.render(mb, ovenContainer, component, view);

        const noteContainer = container.createEl('div', { cls: 'note-container' });
        this.noteInput.render(mb, view).forEach(field => mb.wrapInMDRC(field, noteContainer, component));

        const contentContainer = container.createEl('div', { cls: 'content-container' });
        this.content.render(view, mb.mb.internal, contentContainer);

        const sourceContainer = container.createEl('div', { cls: 'source-container' });
        this.sourceInput.render(view, sourceContainer, mb, component);

        const tagsContainer = container.createEl('div', { cls: 'tags-container' });
        this.tagsInput.render(mb).forEach(field => mb.wrapInMDRC(field, tagsContainer, component));
    }
}