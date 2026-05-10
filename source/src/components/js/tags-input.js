import { InputConfig } from "./input-config";

export class TagsInput extends InputConfig {
    constructor(target, path) {
        super('inlineListSuggester', target);
        this.path = path;
    }
    
    render(mb) {
        this.declaration_arguments = Object.keys(mb.mb.app.metadataCache.getTags()).map(x => {
		        return {
		            name: 'option',
		            value: [x.toString()],
		        };
		    }).concat([{name:"allowOther", value:["true"]}]);
        this.config = super.render();
        this.inputField = mb.createInputFieldMountable(this.path, this.config);
        return [this.inputField];
    }

    update(mb){
        mb.updateMetadata(this.bindTarget, array=> [...new Set(array.map(val=> val[0]=="#"?val:"#"+val))]);
    }
}