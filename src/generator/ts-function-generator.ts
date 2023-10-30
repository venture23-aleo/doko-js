class TSFunctionGenerator {
    code = '';

    addStatement(statement: String) {
        this.code += statement;
    }

    generate(fnName: string, arg: string, argType: string, returnType: string) {
        return `export function ${fnName}(${arg}: ${argType}): ${returnType} {\n` +
            this.code +
            '}\n\n';
    }
}

export { TSFunctionGenerator };