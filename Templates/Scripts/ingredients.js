module.exports = async function (tp, context, engine, change) {
    let ing;
    if (change) {
        ing = await tp.system.suggester(ing => ing.split(".")[0], context.metadata.frontmatter.available_ingredients);
    }
    else {
        ing = await tp.system.multi_suggester(ing => ing.split(".")[0], context.metadata.frontmatter.available_ingredients);
    }
    return ing;
};