export class InputConfig {
    constructor(inputFieldType, bindTarget, renderChildType = "inline", declarationArguments = []) {
        this.bindTarget = bindTarget;
        this.renderChildType = renderChildType;
        this.inputFieldType = inputFieldType;
        this.declarationArguments = declarationArguments;
    }

    render() {
        return {
            declaration: {
                arguments: this.declarationArguments,
                bindTarget: this.bindTarget,
                inputFieldType: this.inputFieldType,
            },
            renderChildType: this.renderChildType,
        };
    }
}
