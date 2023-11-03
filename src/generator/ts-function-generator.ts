export interface FunctionArgs {
  name: string; // name of argument
  type: string; // data type of argument
}

class TSFunctionGenerator {
  code = '';
  isAsync = false;

  addStatement(statement: String) {
    this.code += statement;
  }

  makeAsync() {
    this.isAsync = true;
    return this;
  }

  generate(fnName: string, args: FunctionArgs[], returnType: string | null) {
    const formattedArgs = args
      .map((arg) => `${arg.name}: ${arg.type}`)
      .join(', ');

    const returnDeclaration = returnType ? `: ${returnType}` : '';
    return (
      `export ${
        this.isAsync ? 'async ' : ''
      }function ${fnName}(${formattedArgs}) ${returnDeclaration} {\n` +
      this.code +
      '}\n\n'
    );
  }
}

export { TSFunctionGenerator };
