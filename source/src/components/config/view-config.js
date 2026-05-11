export class ViewConfig {
    constructor(viewFieldType, bindTarget=null, renderChildType='inline', declaration_arguments=[]) {
        this.bindTarget = bindTarget;
        this.renderChildType = renderChildType;
        this.viewFieldType = viewFieldType;
        this.declaration_arguments = declaration_arguments;
    }

    render(declaration=null) {
        return {
            declaration: declaration || {
                arguments: this.declaration_arguments,
                writeToBindTarget: this.bindTarget,
                viewFieldType: this.viewFieldType,
            },
            renderChildType: this.renderChildType,
        }
    }
}
