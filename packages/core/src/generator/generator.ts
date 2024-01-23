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

import { toCamelCase, capitalize } from '@aleojs/utils';
import TSClassGenerator from '@/generator/ts-class-generator';
import { GetLeoSchemaAlias, GetLeoSchemaName, GetConverterFunctionName, GetLeoTypeNameFromJS, GetLeoMappingFuncName, GetContractClassName, } from './leo-naming';
import { FormatLeoDataType, GenerateTSImport, InferJSDataType, GenerateTypeConversionStatement, GenerateZkRunCode, GenerateZkMappingCode} from './generator-utils';

class Generator {
  private refl: AleoReflection;

  generatedTypes: string[] = [];
  generatedLeo2JSFn: string[] = [];
  generatedJS2LeoFn: string[] = [];

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
        tsInterfaceGenerator.addField(
          member.key,
          InferJSDataType(dataType)
        );
        zodInterfaceGenerator.addField(
          member.key,
          GetLeoSchemaName(dataType)
        );
      });

      // Write type definition for JS
      code = code.concat(
        tsInterfaceGenerator.generate(customType.name),
        '\n\n'
      );

      // Write type definition for Leo/ ZodObject
      const leoSchemaName = GetLeoSchemaName(customType.name);
      code = code.concat(zodInterfaceGenerator.generate(leoSchemaName), '\n');

      // Generate type alias
      const leoSchemaAlias = `${customType.name}Leo`;
      code = code.concat(
        GetLeoSchemaAlias(leoSchemaAlias, customType.name)
      );

      // Cache the customType for later to use it in types/index.ts file
      this.generatedTypes.push(customType.name, leoSchemaName, leoSchemaAlias);
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

    // Cache function name for import/export in js2leo or leo2js index.ts file
    if (conversionTo == STRING_JS) this.generatedLeo2JSFn.push(fnName);
    else this.generatedJS2LeoFn.push(fnName);

    return code;
  }

  // Generate TS to Leo converter functions
  public generateJSToLeo() {
    let code = GenerateTSImport(this.generatedTypes, '../types');
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
    let code = GenerateTSImport(this.generatedTypes, '../types');
    code = code.concat(JS_FN_IMPORT);

    this.refl.customTypes.forEach((customType: StructDefinition) => {
      code = code.concat(this.generateConverterFunction(customType, STRING_JS));
    });
    return code;
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
      if (this.refl.isCustomType(leoType)) fnName = `js2leo.json(${fnName})`;
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

      const rhs = GenerateTypeConversionStatement(
        output,
        input,
        STRING_JS
      );
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

  private generateMappingFunction(mapping: MappingDefinition) {
    const fnGenerator = new TSFunctionGenerator()
      .setIsAsync(true)
      .setIsClassMethod(true)
      .setIsExported(false);

    // Generate argument array
    const leoType = FormatLeoDataType(mapping.key).split('.')[0];
    const jsType = InferJSDataType(leoType);

    const argName = 'key';
    const fnArg = { name: argName, type: jsType };

    const variableName = `${argName}Leo`;

    // We ignore the qualifier while generating conversion function
    // for transition function parameter
    let fnName = GenerateTypeConversionStatement(
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
    fnGenerator.addStatement(GenerateZkMappingCode(mapping.name));

    const strippedType = mapping.value.split('.')[0];
    const result = GenerateTypeConversionStatement(
      mapping.value,
      'result',
      STRING_JS
    );
    fnGenerator.addStatement(`\t return ${result}; \n`);

    const returnType = InferJSDataType(strippedType);
    return fnGenerator.generate(
      GetLeoMappingFuncName(mapping.name),
      [fnArg],
      `Promise<${returnType}>`
    );
  }

  // Generate transition function body
  public generateContractClass() {
    // Create import statement for custom types
    let importStatement = '';

    // List all the custom types required including that from imports  
    const customTypes = [...this.refl.customTypes];
    if (this.refl.imports) {
      Array.from(this.refl.imports).forEach(([key, val]) =>
        customTypes.push(...val.customTypes)
      );
    }

    // Generate import statement for all custom types
    if (customTypes.length > 0) {
      const mapping = customTypes.map((member) => {
        return {
          name: member.name,
          leoFn: GetConverterFunctionName(member.name, STRING_LEO),
          jsFn: GetConverterFunctionName(member.name, STRING_JS)
        };
      });

      importStatement = importStatement.concat(
        GenerateTSImport(mapping.map((member) => `\t${member.name}`), './types'),
        GenerateTSImport(mapping.map((member) => `\t${member.leoFn}`), './js2leo'),
        GenerateTSImport(mapping.map((member) => `\t${member.jsFn}`), './leo2js'))
    }

    importStatement = importStatement.concat(
      GenerateTSImport(['zkRun', 'ContractConfig', 'snarkDeploy', 'zkGetMapping', 'js2leo', 'leo2js'], '@aleojs/core'),
      GenerateTSImport(['BaseContract'], '../../contract/base-contract'),
    );

    const code = importStatement;
    const programName = this.refl.programName;

    const classGenerator = new TSClassGenerator().extendsFrom('BaseContract');

    // Add constructor
    classGenerator.addMethod(
      `constructor(config: ContractConfig = {}) {
        super(config);
    this.config = {
        ...this.config,
        appName: '${programName}',
        contractPath: '${PROGRAM_DIRECTORY}${programName}', 
        fee: '0.01'
    };
  }\n`).addMember({ key: 'config', val: 'ContractConfig' });;

    this.refl.functions.forEach((func) => {
      if (func.type === 'function') {
        classGenerator.addMethod(this.generateTransitionFunction(func));
      }
    });

    this.refl.mappings.forEach((mapping) => {
      classGenerator.addMethod(this.generateMappingFunction(mapping));
    });

    return code.concat(
      classGenerator.generate(GetContractClassName(programName))
    );
  }
}

export { Generator };