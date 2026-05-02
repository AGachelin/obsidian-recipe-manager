const tp = await engine.getPlugin("templater-obsidian")?.templater.current_functions_object;
const mb = engine.getPlugin('obsidian-meta-bind-plugin').api;
const change = context.args !== undefined;
const ing = await tp.user.ingredients(tp, context, engine, change);
const current_ing_target = mb.createBindTarget('frontmatter', context.file.path, ['ingredients']);
const available_ing_target = mb.createBindTarget('frontmatter', context.file.path, ['available_ingredients']);
const available = await tp.app.vault.getFolderByPath("Ingredients").children.filter(x => x instanceof tp.obsidian.TFile).map(x => x.name);
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
    if(change && name !== ing){
        return available.filter(i => i !== ing);
    }
    else{
        return available.filter(i => !ing.includes(i));
    }
}

mb.updateMetadata(current_ing_target, updateIng);
mb.updateMetadata(available_ing_target, updateAvailable);