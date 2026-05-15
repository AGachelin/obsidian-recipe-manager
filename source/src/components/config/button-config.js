export class ButtonConfig {
    constructor(id, label, cssclass=null, style="default", hidden=true, isPreview=false){
        this.id =id;
        this.style = style;
        this.label = label;
        this.hidden = hidden;
        this.actions = [];
        this.isPreview = isPreview;
        this.cssclass = cssclass;
    }
    addAction(action){
        this.actions.push(action);
    }
    addTemplaterCreateNoteAction(templateFile, folderPath, fileName){
        const action = {
            type: "templaterCreateNote",
            templateFile: templateFile,
            folderPath: folderPath,
            fileName: fileName,
        }
        this.addAction(action);
    }
    addJsAction(file){
        const action = {
            type: "js",
            file: file,
        };
        this.addAction(action);
    }
    addUpdateMetadataAction(bindTarget, value, evaluate=true){
        const action = {
            type: "updateMetadata",
            bindTarget: bindTarget,
            evaluate: evaluate,
            value: value,
        };
        this.addAction(action);
    }
    render(){
        const declaration = {
                        id: this.id,
                        style: this.style,
                        label: this.label,
                        hidden: this.hidden
        }
        this.cssclass ? declaration["class"] = this.cssclass : null;
        if(this.actions.length == 1){
            declaration["action"] = this.actions[0];
        }
        else {
            declaration["actions"] = this.actions;
        }
        return {
            declaration: declaration,
            isPreview: this.isPreview
        }
    }
    getId(){
        return this.id;
    }
}