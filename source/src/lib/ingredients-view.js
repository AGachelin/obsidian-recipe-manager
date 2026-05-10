function formatIngredientAmount(ingredient) {
    const { id, amount, unit, name } = ingredient;

    if (!amount) {
        return `\`VIEW[{ingredients["${id}"].name}]\``;
    }

    const amountView = `\`VIEW[convertBack({ingredients["${id}"].unit}, {ingredients["${id}"].amount}, {ingredients["${id}"].name}, {person.current}/{person.raw})]\``;

    if (unit === "") {
        const unitView = `\`VIEW[{ingredients["${id}"].unit}]\``;
        const nameView = `\`VIEW[{ingredients["${id}"].name}]\``;
        return `${amountView} ${unitView} ${nameView}`;
    } else {
        const nameView = `\`VIEW[{ingredients["${id}"].name}]\``;
        return `${amountView} de ${nameView}`;
    }
}

function viewIngredients(ingredients) {
    let view = "";
    let key;

    for (key in ingredients) {
        if (key !== "last_id") {
            view += formatIngredientAmount(ingredients[key]);
            view += '\n';
        }
    }
    return view;
}

const ingredientsView = {
    viewIngredients,
    formatIngredientAmount
};

export { ingredientsView };
