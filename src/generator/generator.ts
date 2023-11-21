/**
 * Generate the following files
 * 1. Type files  : JS/Leo Interface for all the custom types declared in the aleo
 * 2. JS2Leo File : Conversion from JS Object to Leo suitable object
 * 3. Leo2JS File : Conversion from Leo Object to JS Object
 */

import { AleoReflection } from '../parser/parser';
import {
  ConvertToJSType,
  FunctionDefinition,
  StructDefinition
} from '../utils/aleo-utils';
import { TSInterfaceGenerator } from './ts-interface-generator';
import { ZodObjectGenerator } from './zod-object-generator';
import { FunctionArgs, TSFunctionGenerator } from './ts-function-generator';
import {
  SCHEMA_IMPORT,
  LEO_FN_IMPORT,
  STRING_JS,
  STRING_LEO,
  PROGRAM_DIRECTORY
} from './string-constants';
import { toCamelCase, capitalize } from '../utils/formatters';

class Generator {
  private refl: AleoReflection;

  generatedTypes: string[] = [];
  generatedLeo2JSFn: string[] = [];
  generatedJS2LeoFn: string[] = [];

  constructor(aleoReflection: AleoReflection) {
    this.refl = aleoReflection;
  }

  private inferJSDataType(type: string): string {
    // Check if it is a custom type
    if (this.refl.isCustomType(type)) return type;

    // Check if it is a primitive type
    const tsType = ConvertToJSType(type);
    if (tsType) return tsType;
    else throw new Error(`Undeclared type encountered: ${type}`);
  }

  private createLeoSchemaName(customTypeName: string) {
    return `leo${capitalize(customTypeName)}Schema`;
  }

  private createLeoSchemaAlias(leoSchemaAlias: string, customType: string) {
    const leoSchemaName = this.createLeoSchemaName(customType);
    return (
      `export type ${leoSchemaAlias} = z.infer<typeof ${leoSchemaName}>;` +
      '\n\n'
    );
  }

  private createImportStatement() {
    // Create import statement for custom types
    let importStatement = 'import {\n';
    importStatement = importStatement.concat(
      this.refl.customTypes
        .map((member) => `\t${member.name}, ${member.name}Leo,`)
        .join('\n'),
      '\n} from "../types"\n',
      LEO_FN_IMPORT,
      '\n\n'
    );

    return importStatement;
  }

  // Generate code for types file
  public generateTypes() {
    // Import primitive schema type for Leo (leo-types.ts)
    let code = SCHEMA_IMPORT + '\n\n';

    this.refl.customTypes.forEach((customType: StructDefinition) => {
      // Create Typescript/ Zod interface for custom types
      const tsInterfaceGenerator = new TSInterfaceGenerator();
      const zodInterfaceGenerator = new ZodObjectGenerator();

      customType.members.forEach((member) => {
        // Strip any scope qualifier (private, public)
        const dataType = member.val.split('.')[0];
        tsInterfaceGenerator.addField(
          member.key,
          this.inferJSDataType(dataType)
        );
        zodInterfaceGenerator.addField(
          member.key,
          this.createLeoSchemaName(dataType)
        );
      });

      // Write type definition for JS
      code = code.concat(
        tsInterfaceGenerator.generate(customType.name),
        '\n\n'
      );

      // Write type definition for Leo/ ZodObject
      const leoSchemaName = this.createLeoSchemaName(customType.name);
      code = code.concat(zodInterfaceGenerator.generate(leoSchemaName), '\n');

      // Generate type alias
      const leoSchemaAlias = `${customType.name}Leo`;
      code = code.concat(
        this.createLeoSchemaAlias(leoSchemaAlias, customType.name)
      );

      // Cache the customType for later to use it in types/index.ts file
      this.generatedTypes.push(customType.name, leoSchemaName, leoSchemaAlias);
    });

    return code;
  }

  // Create a converter function name string from dataType
  // includes custom types too
  private generateConverterFunctionName(type: string, conversionTo: string) {
    if (this.refl.isCustomType(type))
      return conversionTo == 'js' ? `get${type}` : `get${type}Leo`;
    else return type;
  }

  private generateConverterFunction(
    customType: StructDefinition,
    conversionTo: string
  ) {
    const jsType = customType.name;
    const leoType = jsType + 'Leo';

    const argName = toCamelCase(customType.name);

    // if we are converting to js then the argType must be LEO and return type must be JS
    const argType = conversionTo == STRING_JS ? leoType : jsType;
    const returnType = conversionTo == STRING_JS ? jsType : leoType;

    const fnGenerator = new TSFunctionGenerator();

    // Add declaration statement
    fnGenerator.addStatement(`\tconst result: ${returnType} = {\n`);

    // Convert each of the member of the customType
    customType.members.forEach((member) => {
      // Split qualifier private/public
      const type = member.val.split('.')[0];

      // Determine member conversion function
      let conversionFnName = this.generateConverterFunctionName(
        type,
        conversionTo
      );

      // Add conversion statement
      fnGenerator.addStatement(
        `\t\t${member.key}: ${conversionFnName}(${argName}.${member.key}),\n`
      );
    });

    // Add return statement
    fnGenerator.addStatement('\t}\n\treturn result;\n');

    const fnName = 'get' + returnType;
    let code = fnGenerator.generate(
      fnName,
      [{ name: argName, type: argType }],
      returnType
    );

    // Cache function name for import/export in js2leo or leo2js index.ts file
    if (conversionTo == STRING_JS) this.generatedLeo2JSFn.push(fnName);
    else this.generatedJS2LeoFn.push(fnName);

    return code;
  }

  // Generate TS to Leo converter functions
  public generateJSToLeo() {
    let code = this.createImportStatement();

    this.refl.customTypes.forEach((customType: StructDefinition) => {
      code = code.concat(
        this.generateConverterFunction(customType, STRING_LEO)
      );
    });
    return code;
  }

  // Generate Leo to TS converter functions
  public generateLeoToJS() {
    // Create import statement for custom types
    let code = this.createImportStatement();
    this.refl.customTypes.forEach((customType: StructDefinition) => {
      code = code.concat(this.generateConverterFunction(customType, STRING_JS));
    });
    return code;
  }

  private generateTransitionFunction(func: FunctionDefinition) {
    const fnGenerator = new TSFunctionGenerator().makeAsync();

    const args: FunctionArgs[] = [];
    const localVariables: string[] = [];

    func.inputs.forEach((input) => {
      // Generate argument array
      const leoType = input.val.split('.')[0];
      const jsType = this.inferJSDataType(leoType);
      const argName = input.key;
      args.push({ name: argName, type: jsType });

      // Generate JS to leo conversion code for each type
      const converterFuncName = this.generateConverterFunctionName(
        leoType,
        STRING_LEO
      );

      const variableName = `${argName}Leo`;
      localVariables.push(variableName);

      let fnName = `${converterFuncName}(${argName})`;
      if (this.refl.isCustomType(leoType)) fnName = `JSON.stringify(${fnName})`;
      else fnName = `js2leo.${fnName}`;

      const conversionCode = `\tconst ${variableName} = ${fnName};\n`;
      fnGenerator.addStatement(conversionCode);
    });

    // Param declaration
    const params = localVariables.join(', ');
    fnGenerator.addStatement(`\n\tconst params = [${params}]\n`);

    // Add zkRun statement
    fnGenerator.addStatement(`\tconst result = await zkRun({
      /*privateKey: PRIVATE_KEY,
      viewKey: VIEW_KEY,
      appName: APP_NAME,*/
      contractPath: CONTRACT_PATH,
      transition: '${func.name}',
      params,
      /*fee: FEE*/
    });\n`);

    if (func.outputs.length == 0)
      return fnGenerator.generate(func.name, args, null);

    let outputs = func.outputs.map((output) => output.split('.')[0]);
    const returnTypes: string[] = [];

    const createOutputVariable = (index: number) => `out${index}`;

    outputs.forEach((output, index) => {
      let resultConverter = this.generateConverterFunctionName(
        output,
        STRING_JS
      );

      if (this.refl.isCustomType(output)) {
        fnGenerator.addStatement(
          `\t const ${createOutputVariable(
            index
          )} =  ${resultConverter}(result.data[${index}]);\n`
        );
      } else {
        resultConverter = `leo2js.${resultConverter}`;
        // cast non-custom datatype to string
        fnGenerator.addStatement(
          `\t const ${createOutputVariable(
            index
          )} = ${resultConverter}(result.data[0] as string);\n`
        );
      }
      returnTypes.push(this.inferJSDataType(output));
    });

    // Format return statement and return type accordingly
    let returnTypeString = '';
    if (returnTypes.length === 1) {
      fnGenerator.addStatement(`\t return ${createOutputVariable(0)};\n`);
      returnTypeString = `Promise<${returnTypes[0]}>`;
    } else {
      const returnValues = returnTypes.map((type, index) =>
        createOutputVariable(index)
      );
      fnGenerator.addStatement(`\t return [${returnValues.join(', ')}];\n`);
      returnTypeString = `Promise<[${returnTypes.join(', ')}]>`;
    }
    return fnGenerator.generate(func.name, args, returnTypeString);
  }

  // Generate transition function body
  public generatedTransitionFunctions() {
    // Create import statement for custom types
    let importStatement = "import * as js2leo from './js2leo/common';\n";
    importStatement = importStatement.concat(
      "import * as leo2js from './leo2js/common';\n"
    );

    if (this.refl.customTypes.length > 0) {
      const mapping = this.refl.customTypes.map((member) => {
        return {
          name: member.name,
          leoFn: this.generateConverterFunctionName(member.name, STRING_LEO),
          jsFn: this.generateConverterFunctionName(member.name, STRING_JS)
        };
      });

      importStatement = importStatement.concat(
        'import {\n',
        mapping.map((member) => `\t${member.name},`).join('\n'),
        '\n} from "./types";\n',
        'import {\n',
        mapping.map((member) => `\t${member.leoFn},`).join('\n') +
          `\n} from './js2leo';\n`,
        'import {\n',
        mapping.map((member) => `\t${member.jsFn},`).join('\n') +
          `\n} from './leo2js';\n\n`
      );
    }

    importStatement = importStatement.concat(
      `import { zkRun } from './utils'; \n`
    );

    let code = importStatement;
    const programName = this.refl.programName;

    const privateKey = this.refl.env?.get('PRIVATE_KEY');
    if (!privateKey || privateKey.length == 0)
      throw new Error(
        'Invalid private key for program: ' + this.refl.programName
      );

    code = code.concat(
      `const PRIVATE_KEY = '${privateKey}';\n`,
      `const VIEW_KEY = '${privateKey}';\n`,
      `const APP_NAME = '${programName}';\n`,
      `const CONTRACT_PATH = '${PROGRAM_DIRECTORY}${programName}';\n`,
      `const FEE = '0.01';\n\n`
    );

    this.refl.functions.forEach((func) => {
      if (func.type === 'function') {
        code = code.concat(this.generateTransitionFunction(func));
      }
    });

    return code;
  }
}

export { Generator };
