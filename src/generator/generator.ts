/**
 * Generate the following files
 * 1. Type files  : JS/Leo Interface for all the custom types declared in the aleo
 * 2. JS2Leo File : Conversion from JS Object to Leo suitable object
 * 3. Leo2JS File : Conversion from Leo Object to JS Object
 */

import { AleoReflection } from '@/parser/parser';
import {
  ConvertToJSType,
  FunctionDefinition,
  GetLeoArrTypeAndSize,
  StructDefinition,
  IsLeoPrimitiveType,
  IsLeoArray,
  MappingDefinition
} from '@/utils/aleo-utils';
import { TSInterfaceGenerator } from '@/generator/ts-interface-generator';
import { ZodObjectGenerator } from '@/generator/zod-object-generator';
import {
  FunctionArgs,
  TSFunctionGenerator
} from '@/generator/ts-function-generator';
import {
  SCHEMA_IMPORT,
  STRING_JS,
  STRING_LEO,
  PROGRAM_DIRECTORY,
  LEO_FN_IMPORT,
  JS_FN_IMPORT
} from '@/generator/string-constants';
import { toCamelCase, capitalize } from '@/utils/formatters';
import TSClassGenerator from '@/generator/ts-class-generator';

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

  private createLeoSchemaName(typeName: string) {
    if (IsLeoArray(typeName)) {
      const [type, size] = GetLeoArrTypeAndSize(typeName);
      const strippedSize = size.match(/\d+/);
      return `z.array(leo${capitalize(type)}Schema).length(${strippedSize})`;
    }
    return `leo${capitalize(typeName)}Schema`;
  }

  private createLeoSchemaAlias(leoSchemaAlias: string, customType: string) {
    const leoSchemaName = this.createLeoSchemaName(customType);
    return (
      `export type ${leoSchemaAlias} = z.infer<typeof ${leoSchemaName}>;` +
      '\n\n'
    );
  }

  // @TODO make a common function for import statement generation
  private createImportStatement() {
    // Create import statement for custom types
    let importStatement = 'import {\n';
    importStatement = importStatement.concat(
      this.refl.customTypes
        .map((member) => `\t${member.name}, ${member.name}Leo,`)
        .join('\n'),
      '\n} from "../types";\n',
      '\n'
    );

    return importStatement;
  }

  // Generate statement to convert type back and forth
  // Eg: private(js2leo.u32(count))
  // type: u32.private
  // inputField: input to u32 function
  // conversionTo: js or leo
  private generateTypeConversionStatement(
    leoType: string,
    inputField: string,
    conversionTo: string
  ) {
    // Split qualifier private/public
    const [type, qualifier] = leoType.split('.');

    // Determine member conversion function
    const conversionFnName = this.generateConverterFunctionName(
      type,
      conversionTo
    );

    const namespace = conversionTo === 'js' ? 'leo2js' : 'js2leo';

    const isArray = IsLeoArray(type);
    if (isArray) {
      // Pass additional conversion function
      const [dataType, size] = GetLeoArrTypeAndSize(type);
      inputField = inputField.concat(`, ${namespace}.${dataType}`);
    }

    let fn = `${conversionFnName}(${inputField})`;

    // if this is not a custom type we have to use the
    // conversion function from namespace
    if (IsLeoPrimitiveType(type) || isArray) {
      fn = `${namespace}.${fn}`;

      if (conversionTo === 'leo') {
        if (qualifier) fn = `${namespace}.${qualifier}Field(${fn})`;
      }
    }

    return fn;
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
    else if (IsLeoArray(type)) return 'array';
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
      const lhs = member.key;
      const inputField = `${argName}.${member.key}`;
      const rhs = this.generateTypeConversionStatement(
        member.val,
        inputField,
        conversionTo
      );

      // Add conversion statement
      fnGenerator.addStatement(`\t\t${lhs}: ${rhs},\n`);
    });

    // Add return statement
    fnGenerator.addStatement('\t}\n\treturn result;\n');

    const fnName = 'get' + returnType;
    const code = fnGenerator.generate(
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
    code = code.concat(LEO_FN_IMPORT);

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
    code = code.concat(JS_FN_IMPORT);

    this.refl.customTypes.forEach((customType: StructDefinition) => {
      code = code.concat(this.generateConverterFunction(customType, STRING_JS));
    });
    return code;
  }

  // Resolve import return types
  // Some return types are referenced by import file
  // Eg: token.leo/token.record
  private formatLeoDataType(type: string) {
    if (type.includes('/')) type = type.split('/')[1];
    return type;
  }

  private generateTransitionFunction(func: FunctionDefinition) {
    const fnGenerator = new TSFunctionGenerator()
      .setIsAsync(true)
      .setIsClassMethod(true)
      .setIsExported(false);

    const args: FunctionArgs[] = [];
    const localVariables: string[] = [];

    func.inputs.forEach((input) => {
      // Generate argument array
      const leoType = this.formatLeoDataType(input.val).split('.')[0];
      const jsType = this.inferJSDataType(leoType);
      const argName = input.key;
      args.push({ name: argName, type: jsType });

      const variableName = `${argName}Leo`;
      localVariables.push(variableName);

      // We ignore the qualifier while generating conversion function
      // for transition function parameter
      let fnName = this.generateTypeConversionStatement(
        leoType,
        argName,
        STRING_LEO
      );

      // For custom type that produce object it must be converted to string
      if (this.refl.isCustomType(leoType)) fnName = `js2leo.json(${fnName})`;
      if (IsLeoArray(leoType)) fnName = `js2leo.arr2string(${fnName})`;

      const conversionCode = `\tconst ${variableName} = ${fnName};\n`;
      fnGenerator.addStatement(conversionCode);
    });

    // Param declaration
    const params = localVariables.join(', ');
    fnGenerator.addStatement(`\n\tconst params = [${params}]\n`);

    // Add zkRun statement
    fnGenerator.addStatement(`\tconst result = await zkRun({
      config: this.config,
      transition: '${func.name}',
      params,
    });\n`);

    fnGenerator.addStatement(
      '\t if(this.config.mode === "execute") return result; \n'
    );

    // Ignore 'future' returntype for now
    const funcOutputs = func.outputs
      .map((output) => this.formatLeoDataType(output))
      .filter((output) => !output.includes('future'));

    if (funcOutputs.length == 0)
      return fnGenerator.generate(func.name, args, null);

    const returnValues: { name: string; type: string }[] = [];
    const createOutputVariable = (index: number) => `out${index}`;

    funcOutputs.forEach((output, index) => {
      const lhs = createOutputVariable(index);
      let input = `result.data[${index}]`;

      // cast non-custom datatype to string
      const type = output.split('.')[0];
      if (IsLeoPrimitiveType(type)) input = `${input} as string`;

      const rhs = this.generateTypeConversionStatement(
        output,
        input,
        STRING_JS
      );
      fnGenerator.addStatement(`\tconst ${lhs} = ${rhs};\n`);

      returnValues.push({
        name: lhs,
        type: this.inferJSDataType(type)
      });
    });

    // Format return statement and return type accordingly
    let returnTypeString = '';
    if (returnValues.length === 1) {
      fnGenerator.addStatement(`\t return ${returnValues[0].name};\n`);
      returnTypeString = `Promise<${returnValues[0].type} | any>`;
    } else {
      const variables = returnValues.map((returnValue) => returnValue.name);
      const types = returnValues.map((returnValues) => returnValues.type);
      fnGenerator.addStatement(`\t return [${variables.join(', ')}];\n`);
      returnTypeString = `Promise<[${types.join(', ')}] | any>`;
    }
    return fnGenerator.generate(func.name, args, returnTypeString);
  }

  private generateMappingFunction(mapping: MappingDefinition) {
    const fnGenerator = new TSFunctionGenerator()
      .setIsAsync(true)
      .setIsClassMethod(true)
      .setIsExported(false);

    // Generate argument array
    const leoType = this.formatLeoDataType(mapping.key).split('.')[0];
    const jsType = this.inferJSDataType(leoType);

    const argName = 'key';
    const fnArg = { name: argName, type: jsType };

    const variableName = `${argName}Leo`;

    // We ignore the qualifier while generating conversion function
    // for transition function parameter
    let fnName = this.generateTypeConversionStatement(
      leoType,
      argName,
      STRING_LEO
    );

    // For custom type that produce object it must be converted to string
    if (this.refl.isCustomType(leoType)) fnName = `js2leo.json(${fnName})`;

    const conversionCode = `\tconst ${variableName} = ${fnName};\n`;
    fnGenerator.addStatement(conversionCode);

    // Param declaration
    fnGenerator.addStatement(`\n\tconst params = [${variableName}]\n`);

    // Add zkRun statement
    fnGenerator.addStatement(`\tconst result = await zkGetMapping({
      config: this.config,
      transition: '${mapping.name}',
      params,
    });\n`);

    const fieldName = 'result';

    const strippedType = mapping.value.split('.')[0];
    const result = this.generateTypeConversionStatement(
      mapping.value,
      'result',
      STRING_JS
    );
    fnGenerator.addStatement(`\t return ${result}; \n`);

    const returnType = this.inferJSDataType(strippedType);
    return fnGenerator.generate(
      mapping.name,
      [fnArg],
      `Promise<${returnType}>`
    );
  }

  // Generate transition function body
  public generateContractClass() {
    // Create import statement for custom types
    let importStatement = "import * as js2leo from './js2leo/common';\n";
    importStatement = importStatement.concat(
      "import * as leo2js from './leo2js/common';\n"
    );

    const customTypes = [...this.refl.customTypes];
    if (this.refl.imports) {
      Array.from(this.refl.imports).forEach(([key, val]) =>
        customTypes.push(...val.customTypes)
      );
    }

    if (customTypes.length > 0) {
      const mapping = customTypes.map((member) => {
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
          "\n} from './js2leo';\n",
        'import {\n',
        mapping.map((member) => `\t${member.jsFn},`).join('\n') +
          "\n} from './leo2js';\n"
      );
    }

    importStatement = importStatement.concat(
      "import { zkRun, ContractConfig, snarkDeploy, zkGetMapping } from './utils'; \n\n"
    );
    importStatement = importStatement.concat(
      "const networkConfig = require('../../aleo-config'); \n\n"
    );

    const code = importStatement;
    const programName = this.refl.programName;

    const classGenerator = new TSClassGenerator();

    // Add constructor
    classGenerator.addMethod(
      `constructor(config: ContractConfig = {}) {
    this.config = {
        appName: '${programName}',
        contractPath: '${PROGRAM_DIRECTORY}${programName}', 
        fee: '0.01'
    };
    this.config = {...this.config, ...config};
    if(config.networkName) {
      if(!networkConfig?.[config.networkName])
        throw Error(\`Network config not defined for \${config.networkName}. Please add the config in aleo-config.js file in root directory\`)
      this.config = {
        ...this.config, 
        network: networkConfig[config.networkName]
      };
    }
}\n\n`
    );
    classGenerator.addMethod(` async deploy(): Promise<any> {
      const result = await snarkDeploy({
        config: this.config,
      });
  
      return result;
    }`);
    classGenerator.addMember({ key: 'config', val: 'ContractConfig' });

    this.refl.functions.forEach((func) => {
      if (func.type === 'function') {
        classGenerator.addMethod(this.generateTransitionFunction(func));
      }
    });

    this.refl.mappings.forEach((mapping) => {
      classGenerator.addMethod(this.generateMappingFunction(mapping));
    });

    return code.concat(
      classGenerator.generate(`${capitalize(programName)}Contract`)
    );
  }
}

export { Generator };
