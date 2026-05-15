export class ViewConfig {
    constructor(declaration=null, viewFieldType="", bindTarget = null, renderChildType = "inline", declaration_arguments = []) {
        this.bindTarget = bindTarget;
        this.renderChildType = renderChildType;
        this.viewFieldType = viewFieldType;
        this.declaration_arguments = declaration_arguments;
        this.declaration = declaration;
    }

    render() {
        return {
            declaration:
                this.declaration ||
                {
                    arguments: this.declaration_arguments,
                    writeToBindTarget: this.bindTarget,
                    viewFieldType: this.viewFieldType,
                },
            renderChildType: this.renderChildType,
        };
    }
}
