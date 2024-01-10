export interface FunctionArgs {
  name: string; // name of argument
  type: string; // data type of argument
}

class TSFunctionGenerator {
  code = '';
  isAsync = false;
  isExported = true;
  isClassMethod = false;

  addStatement(statement: string) {
    this.code += statement;
  }

  setIsAsync(state: boolean) {
    this.isAsync = state;
    return this;
  }

  setIsExported(state: boolean) {
    this.isExported = state;
    return this;
  }

  setIsClassMethod(state: boolean) {
    this.isClassMethod = state;
    return this;
  }

  generate(fnName: string, args: FunctionArgs[], returnType: string | null) {
    const formattedArgs = args
      .map((arg) => `${arg.name}: ${arg.type}`)
      .join(', ');

    const exportDecl = this.isExported ? 'export ' : '';
    const asynDecl = this.isAsync ? 'async ' : '';
    const functionDecl = this.isClassMethod ? '' : 'function ';

    const returnDeclaration = returnType ? `: ${returnType}` : '';
    return (
      `${exportDecl}${asynDecl}${functionDecl}${fnName}(${formattedArgs}) ${returnDeclaration} {\n` +
      this.code +
      '}\n\n'
    );
  }
}

export { TSFunctionGenerator };
