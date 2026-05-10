function createInputFields(frontmatter, mb) {
    const inputs = {};

    inputs.note = createFieldInput(
        'note',
        frontmatter.note,
        `\`VIEW[clamp({memory^note}, 0, 5)][math(hidden):note]\``
    );

    inputs.oven = createFieldInput(
        'oven',
        frontmatter.oven || 0,
        `\`VIEW[bind({memory^oven}, 0, null)][math(hidden):oven]\``
    );

    inputs.person = createFieldInput(
        'person.raw',
        frontmatter.person?.raw || 1,
        `\`VIEW[bind({memory^person.raw}, 0, 1)][math(hidden):person.raw]\``
    );

    inputs.source = `\`INPUT[text(placeholder(Source)):source]\``;
    inputs.content = '[[content|Modifier le contenu]]';

    return inputs;
}

function createViewFields(frontmatter) {
    const views = {};

    views.note = `<div class="star-rating" style="--rating: ${frontmatter.note};"></div>\n`;
    views.oven = `\`VIEW[{oven}]\``;
    views.source = `\`VIEW[{source}][text(renderMarkdown)]\``;
    views.content = '```meta-bind-embed\n[[content]]\n```';

    return views;
}

function createFieldInput(target, defaultValue, viewComponent) {
    return `\`INPUT[number(placeholder(${formatLabel(target)}), defaultValue(${defaultValue})):memory^${target}]\`` + ' ' + viewComponent;
}

function formatLabel(fieldName) {
    const labels = {
        'note': 'Note',
        'oven': 'Oven temp',
        'person.raw': 'Nombre de personnes'
    };
    return labels[fieldName] || fieldName;
}

function renderRecipe(isViewMode, inputs, views, ingredientsView, durationViews, durationInputs) {
    if (isViewMode) {
        return composeViewMode(views, ingredientsView, durationViews);
    } else {
        return composeEditMode(inputs, ingredientsView, durationInputs);
    }
}

function composeEditMode(inputs, ingredientsView, durationInputs) {
    const parts = [
        inputs.note,
        inputs.source,
        inputs.person,
        durationInputs.cook,
        durationInputs.rest,
        durationInputs.prep,
        inputs.content
    ];

    return parts.filter(p => p).join('\n');
}

function composeViewMode(views, ingredientsView, durationViews) {
    const parts = [
        views.note,
        views.source,
        ingredientsView,
        durationViews.cook,
        durationViews.rest,
        durationViews.prep,
        views.content
    ];

    return parts.filter(p => p).join('\n');
}

const recipeRenderer = {
    createInputFields,
    createViewFields,
    renderRecipe
};

export { recipeRenderer };
