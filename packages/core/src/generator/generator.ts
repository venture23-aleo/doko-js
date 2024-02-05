/**
 * Generate the following files
 * 1. Type files  : JS/Leo Interface for all the custom types declared in the aleo
 * 2. JS2Leo File : Conversion from JS Object to Leo suitable object
 * 3. Leo2JS File : Conversion from Leo Object to JS Object
 */

import { AleoReflection } from '@/parser/parser';
import {
  FunctionDefinition,
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

import { toCamelCase } from '@aleojs/utils';
import TSClassGenerator from '@/generator/ts-class-generator';
import {
  GenerateLeoSchemaAliasDeclaration,
  GenerateLeoSchemaName,
  GetConverterFunctionName,
  GetLeoTypeNameFromJS,
  GetLeoMappingFuncName,
  GetContractClassName
} from './leo-naming';
import {
  FormatLeoDataType,
  GenerateTSImport,
  InferJSDataType,
  GenerateTypeConversionStatement,
  GenerateZkRunCode,
  GenerateZkMappingCode
} from './generator-utils';

class Generator {
  private refl: AleoReflection;
  constructor(aleoReflection: AleoReflection) {
    this.refl = aleoReflection;
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
        tsInterfaceGenerator.addField(member.key, InferJSDataType(dataType));
        zodInterfaceGenerator.addField(member.key, GenerateLeoSchemaName(dataType));
      });

      // Write type definition for JS
      code = code.concat(
        tsInterfaceGenerator.generate(customType.name),
        '\n\n'
      );

      // Write type definition for Leo/ ZodObject
      const leoSchemaName = GenerateLeoSchemaName(customType.name);
      code = code.concat(zodInterfaceGenerator.generate(leoSchemaName), '\n');

      // Generate type alias
      const leoSchemaAlias = `${customType.name}Leo`;
      code = code.concat(GenerateLeoSchemaAliasDeclaration(leoSchemaAlias, customType.name));
    });

    return code;
  }

  private generateConverterFunction(
    customType: StructDefinition,
    conversionTo: string
  ) {
    // Eg if the input type is Token then
    // jsType : Token
    // leoType : TokenLeo
    const jsType = customType.name;
    const leoType = GetLeoTypeNameFromJS(jsType);
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
      const rhs = GenerateTypeConversionStatement(
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

    return code;
  }

  // Generate TS to Leo converter functions
  public generateJSToLeo() {
    const generatedTypes: string[] = [];
    this.refl.customTypes.forEach(type => {
      generatedTypes.push(type.name, `${type.name}Leo`)
    });

    let code = GenerateTSImport(
      generatedTypes,
      `../types/${this.refl.programName}`
    );
    code = code.concat(LEO_FN_IMPORT, '\n\n');

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
    const generatedTypes: string[] = [];
    this.refl.customTypes.forEach(type => {
      generatedTypes.push(type.name, `${type.name}Leo`)
    });

    let code = GenerateTSImport(
      generatedTypes,
      `../types/${this.refl.programName}`
    );
    code = code.concat(JS_FN_IMPORT, '\n\n');

    this.refl.customTypes.forEach((customType: StructDefinition) => {
      code = code.concat(this.generateConverterFunction(customType, STRING_JS));
    });
    return code;
  }

  private generateTransitionFunction(func: FunctionDefinition, outUsedTypes: Set<string>) {
    const fnGenerator = new TSFunctionGenerator()
      .setIsAsync(true)
      .setIsClassMethod(true)
      .setIsExported(false);

    const args: FunctionArgs[] = [];
    const localVariables: string[] = [];

    func.inputs.forEach((input) => {
      // Generate argument array
      const leoType = FormatLeoDataType(input.val).split('.')[0];
      const jsType = InferJSDataType(leoType);

      // Create argument for each parameter of function
      const argName = input.key;
      args.push({ name: argName, type: jsType });

      // Can be anything but we just define it as something that ends with leo
      const localVariableName = `${argName}Leo`;
      localVariables.push(localVariableName);

      // We ignore the qualifier while generating conversion function
      // for transition function parameter
      let fnName = GenerateTypeConversionStatement(
        leoType,
        argName,
        STRING_LEO
      );

      // For custom type that produce object it must be converted to string
      if (this.refl.isCustomType(leoType)) {
        outUsedTypes.add(jsType);
        fnName = `js2leo.json(${fnName})`;
      }

      if (IsLeoArray(leoType)) fnName = `js2leo.arr2string(${fnName})`;

      const conversionCode = `\tconst ${localVariableName} = ${fnName};\n`;
      fnGenerator.addStatement(conversionCode);
    });

    // Param declaration
    const params = localVariables.join(', ');
    fnGenerator.addStatement(`\n\tconst params = [${params}]\n`);

    // Add zkRun statement
    fnGenerator.addStatement(GenerateZkRunCode(func.name));

    fnGenerator.addStatement(
      '\t if(this.config.mode === "execute") return result; \n'
    );

    // Ignore 'future' returntype for now
    const funcOutputs = func.outputs
      .map((output) => FormatLeoDataType(output))
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

      const rhs = GenerateTypeConversionStatement(output, input, STRING_JS);
      fnGenerator.addStatement(`\tconst ${lhs} = ${rhs};\n`);

      returnValues.push({
        name: lhs,
        type: InferJSDataType(type)
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

  private generateMappingFunction(mapping: MappingDefinition, usedTypes: Set<string>) {
    const fnGenerator = new TSFunctionGenerator()
      .setIsAsync(true)
      .setIsClassMethod(true)
      .setIsExported(false);

    // Generate argument array
    const leoType = FormatLeoDataType(mapping.key).split('.')[0];
    const jsType = InferJSDataType(leoType);

    const argName = 'key';
    const fnArg = [{ name: argName, type: jsType }];

    const variableName = `${argName}Leo`;

    // We ignore the qualifier while generating conversion function
    // for transition function parameter
    let fnName = GenerateTypeConversionStatement(leoType, argName, STRING_LEO);

    // For custom type that produce object it must be converted to string
    if (this.refl.isCustomType(leoType)) {
      fnName = `js2leo.json(${fnName})`
      // @NOTE can we use custom type as key for mapping?
      usedTypes.add(jsType);
    };

    const conversionCode = `\tconst ${variableName} = ${fnName};\n`;
    fnGenerator.addStatement(conversionCode);

    // Param declaration
    fnGenerator.addStatement(`\n\tconst params = [${variableName}]\n`);

    // Add zkRun statement
    fnGenerator.addStatement(GenerateZkMappingCode(mapping.name));

    const leoReturnType = mapping.value.split('.')[0];
    const result = GenerateTypeConversionStatement(
      mapping.value,
      'result',
      STRING_JS
    );

    fnGenerator.addStatement(`
    if (result != null)
      return ${result};
    else {
      if (defaultValue != undefined) return defaultValue;
      throw new Error(\`${mapping.name} returned invalid value[input: \${key}, output: \${result}\`);
    }`);

    const returnType = InferJSDataType(leoReturnType);
    fnArg.push({ name: 'defaultValue?', type: returnType });
    if (this.refl.isCustomType(leoReturnType))
      usedTypes.add(returnType);

    return fnGenerator.generate(
      GetLeoMappingFuncName(mapping.name),
      fnArg,
      `Promise < ${returnType}> `
    );
  }

  // Generate transition function body
  public generateContractClass() {
    const programName = this.refl.programName;
    const classGenerator = new TSClassGenerator().extendsFrom('BaseContract');

    // Add constructor
    classGenerator
      .addMethod(
        `constructor(config: ContractConfig = {}) {
          super(config);
          this.config = {
            ...this.config,
            appName: '${programName}',
            contractPath: '${PROGRAM_DIRECTORY}${programName}',
            fee: '0.01'
          };
      } \n`)

    const usedTypesSet = new Set<string>();

    this.refl.functions.forEach((func) => {
      if (func.type === 'function') {
        classGenerator.addMethod(this.generateTransitionFunction(func, usedTypesSet));
      }
    });
    this.refl.mappings.forEach((mapping) => {
      classGenerator.addMethod(this.generateMappingFunction(mapping, usedTypesSet));
    });

    const usedTypes = Array.from(usedTypesSet);
    let code = '';
    if (usedTypes.length > 0) {
      code = code.concat(GenerateTSImport(usedTypes, `./types/${programName}`));
      let usedFunctions = usedTypes.map((type) => GetConverterFunctionName(type, STRING_LEO));
      code = code.concat(GenerateTSImport(usedFunctions, `./js2leo/${programName}`));

      usedFunctions = usedTypes.map((type) => GetConverterFunctionName(type, STRING_JS));
      code = code.concat(GenerateTSImport(usedFunctions, `./leo2js/${programName}`));
    }

    code = code.concat(
      GenerateTSImport(
        [
          'zkRun',
          'ContractConfig',
          'snarkDeploy',
          'zkGetMapping',
          'js2leo',
          'leo2js'
        ],
        '@aleojs/core'
      ),
      GenerateTSImport(['BaseContract'], '../../contract/base-contract'),
      '\n\n'
    );
    return code.concat(
      classGenerator.generate(GetContractClassName(programName))
    );
  }
}

export { Generator };
