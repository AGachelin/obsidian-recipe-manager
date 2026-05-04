function filterAvailable(available, current, change){
    let current_ids;
    if (change){
        current_ids = Object.keys(current).filter(i=> i!=context.args.id).map(i => current[i].name);
    }
    else{
        current_ids = Object.keys(current).map(i => current[i].name);
    }
    return available.filter(i => !current_ids.includes(i));
}
async function run(){
    const tp = await engine.getPlugin("templater-obsidian")?.templater.current_functions_object;
    const mb = await engine.getPlugin('obsidian-meta-bind-plugin').api;
    const change = context.args !== undefined;
    const available = await tp.app.vault.getFolderByPath("Ingredients").children.filter(x => x instanceof tp.obsidian.TFile).map(x => x.name);
    const currently_available = filterAvailable(available, context.metadata.frontmatter.ingredients, false);
    if (change) {
        ing = await tp.system.suggester(ing => ing.split(".")[0], currently_available);
        if (!ing) {
            return;
        }
    }
    else {
        ing = await tp.system.multi_suggester(ing => ing.split(".")[0], currently_available);
        if (!ing || ing.length === 0) {
            return;
        }
    }
    const current_ing_target = mb.createBindTarget('frontmatter', context.file.path, ['ingredients']);
    const available_ing_target = mb.createBindTarget('frontmatter', context.file.path, ['available_ingredients']);
    function updateIng(old_ing){
        if(change && ing){
            old_ing[context.args.id].name = ing;
            return old_ing;
        }
        else{
            for(const i in ing){
                old_ing.last_id ++;
                old_ing[old_ing.last_id] = {id: old_ing.last_id, name: ing[i], amount: 0, unit: ''};
            }
        }
        return old_ing;
    }

    function updateAvailable(old_available){
        if(change){
            return filterAvailable(available, context.metadata.frontmatter.ingredients, change).filter(i => i !== ing);
        }
        else{
            return filterAvailable(available, context.metadata.frontmatter.ingredients, change).filter(i => !ing.includes(i));
        }
    }

    mb.updateMetadata(current_ing_target, updateIng);
    mb.updateMetadata(available_ing_target, updateAvailable);
}
run();
module.exports = run;