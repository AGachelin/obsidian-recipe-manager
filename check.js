async function main(engine, component, bindTarget){
    const mb = await engine.getPlugin('obsidian-meta-bind-plugin').api;
    async function check(value){
        if(value<0){
            mb.setMetadata(bindTarget, 1);
        }
        if(!value){
            await new Promise(resolve => setTimeout(resolve, 5000));
            if(!mb.getMetadata(bindTarget)){
                mb.setMetadata(bindTarget, 1);
            }
        }
    }
    const reactive = engine.reactive(check, mb.getMetadata(bindTarget));
    const subscription = mb.subscribeToMetadata(
        bindTarget, 
        component,
        (value) => reactive.refresh(value)
    );
    return reactive;
}
export default main;