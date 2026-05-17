/**
 * Single-recipe editor / reader layout (extends {@link ../render/meta-bind-page-renderer.js MetaBindPageRenderer}).
 * @see ../frontpage/frontpage-renderer.js
 */
import { FRONTMATTER, FRONTMATTER_DEFAULTS, RECIPE_LIVE_READ_KEYS } from "../../shared/constants/recipe.js";
import { hasReadableIngredients, ingredientsContentSignature } from "../../shared/ingredients-utils.js";
import { UI_CLASSES, UI_LABELS } from "../../shared/constants/ui.js";
import { RECIPE_LAYOUT } from "../../shared/constants/recipe-ui.js";
import { Content } from "../../components/recipe-fields/content.js";
import { DurationInput } from "../../components/shared/duration-input.js";
import { IngredientInputTable } from "../../components/recipe-fields/ingredient-input-table.js";
import { IngredientViewTable } from "../../components/recipe-fields/ingredients-view.js";
import { NoteInput } from "../../components/recipe-fields/note-input.js";
import { OvenInput } from "../../components/recipe-fields/oven-input.js";
import { PersonButton } from "../../components/recipe-fields/person-button.js";
import { SourceInput } from "../../components/recipe-fields/source-input.js";
import { TagsInput } from "../../components/shared/tags-input.js";
import { AddIngredientButton } from "../../components/recipe-fields/add-ingredient-button-group.js";
import { ToggleButton } from "../../components/recipe-fields/toggle-button.js";
import { applyMdrcLayoutSteps, wrapMdrcInDedicatedMount } from "../render/mdrc-layout.js";
import { MetaBindPageRenderer } from "../render/meta-bind-page-renderer.js";
import { assignDurationLabels, buildRecipeBindSnapshot } from "./bind-sync.js";
import {
    durationHasDisplay,
    readMetaHasTags,
    readMetaNonEmptyNote,
    readMetaNonEmptyOven,
    readMetaNonEmptySource,
} from "./meta-readers.js";

export class RecipeRenderer extends MetaBindPageRenderer {
    constructor(path) {
        super(path);
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
        this.metadata = {};
        /** @type {{ view: boolean; ingSig: string; rest: string } | null} */
        this._lastFingerprint = null;
        /** @type {{ section: HTMLElement; readFiltered: boolean } | null} */
        this._ingredientsMount = null;
    }

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

        this.#syncIngredientTables(mb, view, snap.ingredientsValue);

        this.noteInput.generate(mb, view, snap.noteValue);
        this.ovenInput.generate(mb, view, snap.ovenValue);
        this.personButton.generate(mb);
        this.sourceInput.generate(mb, view, snap.sourceValue);
        this.tagsInput.generate(mb);
        this.addIngredientButton.generate(mb);
        this.toggleButton.generate(mb, view);
    }

    render(mb, container, component, view, metadata) {
        const meta = metadata ?? {};
        const fingerprint = this.#renderFingerprint(meta, view);

        if (this.#tryPartialIngredientsRefresh(mb, container, component, view, meta, fingerprint)) {
            return;
        }

        container.empty();
        container.classList.add(
            RECIPE_LAYOUT.root,
            view ? RECIPE_LAYOUT.layoutRead : RECIPE_LAYOUT.layoutEdit
        );

        this.generate(mb, view, meta);

        const ingredients =
            this.metadata[FRONTMATTER.INGREDIENTS] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.INGREDIENTS];

        this.#mountToggleBar(mb, component, container, view);

        let mainEl = null;
        if (view) {
            mainEl = this.#mountReadBody(mb, component, container, view, ingredients);
        } else {
            this.#mountEditBody(mb, component, container, view, ingredients);
        }

        const contentParent = mainEl ?? container;
        const contentContainer = contentParent.createEl("div", { cls: RECIPE_LAYOUT.contentContainer });
        this.content.render(view, mb.mb.internal, contentContainer);

        if (!view || readMetaHasTags(this.metadata)) {
            const tagsContainer = contentParent.createEl("div", { cls: RECIPE_LAYOUT.tagsContainer });
            this.tagsInput
                .render(mb)
                .forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, tagsContainer));
        }

        this._lastFingerprint = fingerprint;
    }

    #renderFingerprint(meta, view) {
        const ing =
            meta[FRONTMATTER.INGREDIENTS] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.INGREDIENTS];
        const rest = {};
        for (const key of RECIPE_LIVE_READ_KEYS) {
            if (key !== FRONTMATTER.INGREDIENTS) {
                rest[key] = meta[key];
            }
        }
        return {
            view,
            ingSig: ingredientsContentSignature(ing),
            rest: JSON.stringify(rest),
        };
    }

    #tryPartialIngredientsRefresh(mb, container, component, view, meta, fingerprint) {
        const prev = this._lastFingerprint;
        const mount = this._ingredientsMount;
        if (
            !prev ||
            !mount ||
            prev.view !== fingerprint.view ||
            prev.rest !== fingerprint.rest ||
            prev.ingSig === fingerprint.ingSig
        ) {
            return false;
        }

        this.metadata = meta;
        this.view = view;
        this.generate(mb, view, meta);

        const ingredients =
            meta[FRONTMATTER.INGREDIENTS] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.INGREDIENTS];
        mount.section.empty();
        this.#fillIngredientsSection(
            mb,
            component,
            mount.section,
            view,
            ingredients,
            mount.readFiltered
        );
        this._lastFingerprint = fingerprint;
        return true;
    }

    #syncIngredientTables(mb, view, ingredientsValue) {
        if (view) {
            this.ingredientInputTable.discardMountables();
            this.ingredientViewTable.generate(mb, ingredientsValue, true);
        } else {
            this.ingredientViewTable.discardMountables();
            this.ingredientInputTable.generate(mb, ingredientsValue);
        }
    }

    #mountToggleBar(mb, component, container, view) {
        const el = container.createEl("div", { cls: RECIPE_LAYOUT.toggleBar });
        el.createEl("span", {
            cls: RECIPE_LAYOUT.modeLabel,
            text: view ? UI_LABELS.MODE_READ : UI_LABELS.MODE_EDIT,
        });
        const actions = el.createEl("div", { cls: RECIPE_LAYOUT.toggleActions });
        this.toggleButton
            .render(mb, view)
            .forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, actions));
    }

    #mountReadBody(mb, component, container, view, ingredients) {
        const summary = container.createEl("div", { cls: RECIPE_LAYOUT.readSummary });
        this.#mountPersonBar(mb, component, summary, view);

        const times = summary.createEl("div", { cls: RECIPE_LAYOUT.readTimes });
        let anyTime = false;
        for (const d of [this.prepDuration, this.cookDuration, this.restDuration]) {
            if (durationHasDisplay(d)) {
                anyTime = true;
                this.#mountSingleDuration(mb, component, times, d, view);
            }
        }
        if (!anyTime) {
            times.remove();
        }

        if (readMetaNonEmptyOven(this.metadata)) {
            this.#mountOven(mb, component, summary, view);
        }

        if (readMetaNonEmptyNote(this.metadata)) {
            this.#mountNote(mb, component, summary, view);
        }

        const body = container.createEl("div", {
            cls: hasReadableIngredients(ingredients)
                ? RECIPE_LAYOUT.readBody
                : `${RECIPE_LAYOUT.readBody} ${RECIPE_LAYOUT.readBodySolo}`,
        });

        if (hasReadableIngredients(ingredients)) {
            const aside = body.createEl("aside", { cls: RECIPE_LAYOUT.readAside });
            this.#mountIngredients(mb, component, aside, view, ingredients, { readFiltered: true });
        }

        const main = body.createEl("div", { cls: RECIPE_LAYOUT.readMain });

        if (readMetaNonEmptySource(this.metadata)) {
            this.#mountSource(mb, component, main, view);
        }
        return main;
    }

    #mountEditBody(mb, component, container, view, ingredients) {
        this.#mountIngredients(mb, component, container, view, ingredients, { readFiltered: false });

        const metaStrip = container.createEl("div", { cls: RECIPE_LAYOUT.metaStrip });
        this.#mountPersonBar(mb, component, metaStrip, view);
        this.#mountSource(mb, component, metaStrip, view);

        const details = container.createEl("div", { cls: RECIPE_LAYOUT.details });
        this.#mountNote(mb, component, details, view);
        const timingRow = details.createEl("div", { cls: RECIPE_LAYOUT.timingRow });
        this.#mountAllDurations(mb, component, timingRow, view);
        this.#mountOven(mb, component, timingRow, view);
    }

    #mountIngredients(mb, component, parent, view, ingredients, { readFiltered = false } = {}) {
        const section = parent.createEl("div", { cls: RECIPE_LAYOUT.ingredientsContainer });
        this._ingredientsMount = { section, readFiltered };
        this.#fillIngredientsSection(mb, component, section, view, ingredients, readFiltered);
    }

    #fillIngredientsSection(mb, component, section, view, ingredients, readFiltered) {
        section.createEl("h3", { cls: RECIPE_LAYOUT.sectionHeading, text: UI_LABELS.INGREDIENTS });

        if (view) {
            this.ingredientViewTable.render(mb, ingredients, readFiltered).forEach((row) => {
                const rowEl = section.createEl("div", { cls: RECIPE_LAYOUT.ingredientRow });
                row.forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, rowEl));
            });
            return;
        }

        this.ingredientInputTable.render(mb, ingredients).forEach((row) => {
            const rowEl = section.createEl("div", { cls: RECIPE_LAYOUT.ingredientRow });
            applyMdrcLayoutSteps(mb, component, row.layoutSteps(rowEl));
        });
        const addRow = section.createEl("div", { cls: RECIPE_LAYOUT.addIngredientContainer });
        applyMdrcLayoutSteps(mb, component, this.addIngredientButton.layoutMDRC(mb, addRow));
    }

    #mountSingleDuration(mb, component, parent, durationInput, view) {
        const defaultSec = FRONTMATTER_DEFAULTS.DURATION;
        const steps = durationInput.layoutMDRC(
            mb,
            parent,
            view,
            durationInput.lastValue ?? defaultSec
        );
        applyMdrcLayoutSteps(mb, component, steps);
    }

    #mountAllDurations(mb, component, parent, view) {
        const el = parent.createEl("div", { cls: RECIPE_LAYOUT.durationsContainer });
        const defaultSec = FRONTMATTER_DEFAULTS.DURATION;
        for (const duration of [this.cookDuration, this.restDuration, this.prepDuration]) {
            const steps = duration.layoutMDRC(mb, el, view, duration.lastValue ?? defaultSec);
            applyMdrcLayoutSteps(mb, component, steps);
        }
    }

    #mountPersonBar(mb, component, container, view) {
        const el = container.createEl("div", { cls: RECIPE_LAYOUT.personContainer });
        this.personButton
            .render(mb, view)
            .forEach((field) => wrapMdrcInDedicatedMount(mb, component, field, el));
    }

    #mountSource(mb, component, container, view) {
        const el = container.createEl("div", { cls: RECIPE_LAYOUT.sourceContainer });
        applyMdrcLayoutSteps(
            mb,
            component,
            this.sourceInput.layoutMDRC(
                mb,
                el,
                view,
                this.metadata[FRONTMATTER.SOURCE] ?? FRONTMATTER_DEFAULTS[FRONTMATTER.SOURCE]
            )
        );
    }

    #mountNote(mb, component, container, view) {
        const el = container.createEl("div", { cls: RECIPE_LAYOUT.noteContainer });
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

    #mountOven(mb, component, container, view) {
        const el = container.createEl("div", { cls: RECIPE_LAYOUT.ovenContainer });
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
