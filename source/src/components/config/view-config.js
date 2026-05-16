export class ViewConfig {
    constructor(declaration=null, viewFieldType="", bindTarget = null, renderChildType = "inline", declarationArguments = []) {
        this.bindTarget = bindTarget;
        this.renderChildType = renderChildType;
        this.viewFieldType = viewFieldType;
        this.declarationArguments = declarationArguments;
        this.declaration = declaration;
    }

    render() {
        return {
            declaration:
                this.declaration ||
                {
                    arguments: this.declarationArguments,
                    writeToBindTarget: this.bindTarget,
                    viewFieldType: this.viewFieldType,
                },
            renderChildType: this.renderChildType,
        };
    }
}
