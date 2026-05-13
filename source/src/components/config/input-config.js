export class InputConfig {
    constructor(inputFieldType, bindTarget, renderChildType = "inline", declaration_arguments = []) {
        this.bindTarget = bindTarget;
        this.renderChildType = renderChildType;
        this.inputFieldType = inputFieldType;
        this.declaration_arguments = declaration_arguments;
    }

    render() {
        return {
            declaration: {
                arguments: this.declaration_arguments,
                bindTarget: this.bindTarget,
                inputFieldType: this.inputFieldType,
            },
            renderChildType: this.renderChildType,
        };
    }
}
