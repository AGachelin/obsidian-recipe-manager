function filterAvailable(available, current, excludeId = null) {
    const currentIds = Object.keys(current)
        .filter(i => i !== "last_id" && i !== excludeId)
        .map(i => current[i].name);

    return available.filter(i => !currentIds.includes(i));
}

function updateIngredients(oldIngredients, newIngredients, mode = 'add', ingredientId = null) {
    if (mode === 'change' && ingredientId) {
        oldIngredients[ingredientId].name = newIngredients;
        return oldIngredients;
    }

    if (Array.isArray(newIngredients)) {
        for (const ingredient of newIngredients) {
            oldIngredients.last_id++;
            oldIngredients[oldIngredients.last_id] = {
                id: oldIngredients.last_id,
                name: ingredient,
                amount: 0,
                unit: ''
            };
        }
    }

    return oldIngredients;
}

// Currently not used
function createIngredientObject(id, name) {
    return {
        id: id,
        name: name,
        amount: 0,
        unit: ''
    };
}

// Currently not used
function validateIngredient(ingredient) {
    return ingredient && ingredient.name && typeof ingredient.amount === 'number';
}

const ingredientsManager = {
    filterAvailable,
    updateIngredients,
    createIngredientObject,
    validateIngredient
};

export { ingredientsManager };
