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
  MappingDefinition,
  IsLeoExternalRecord
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
  JS_FN_IMPORT,
  IMPORTS_PATH
} from '@/generator/string-constants';

import { toCamelCase } from '@doko-js/utils';
import TSClassGenerator from '@/generator/ts-class-generator';
import {
  GenerateLeoSchemaAliasDeclaration,
  GenerateLeoSchemaName,
  GetConverterFunctionName,
  GetLeoTypeNameFromJS,
  GetLeoMappingFuncName,
  GetContractClassName,
  GetExternalRecordAlias,
  GetProgramTransitionsTypeName
} from './leo-naming';
import {
  FormatLeoDataType,
  GenerateTSImport,
  InferJSDataType,
  GenerateTypeConversionStatement,
  GenerateZkRunCode,
  GenerateZkMappingCode,
  InferExternalRecordInputDataType,
  GenerateExternalRecordConversionStatement,
  GenerateAsteriskTSImport
} from './generator-utils';
import { OutputArg, TSReceiptTypeGenerator } from './ts-receipt-type-generator';

type GeneratorParams = {
  isImportedAleo?: boolean;
};

class Generator {
  private refl: AleoReflection;
  private programParams?: GeneratorParams;

  constructor(aleoReflection: AleoReflection, params?: GeneratorParams) {
    this.refl = aleoReflection;
    this.programParams = params;
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
        zodInterfaceGenerator.addField(
          member.key,
          GenerateLeoSchemaName(dataType)
        );
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
      code = code.concat(
        GenerateLeoSchemaAliasDeclaration(leoSchemaAlias, customType.name)
      );
    });

    return code;
  }

  private resolveOutputType(output: string): OutputArg {
    if (output.endsWith('record')) {
      const recordName = output.substring(0, output.length - '.record'.length);
      if (this.refl.isRecordType(recordName)) {
        return { recordType: `records.${recordName}` };
      } else {
        return 'external_record';
      }
    }
    if (output.endsWith('.private')) {
      return 'private';
    }
    if (output.endsWith('.future')) {
      return 'future';
    }
    return 'public';
  }

  private generateExternalTransitionsImport(
    externalCalls: FunctionDefinition['calls']
  ) {
    const groupped: Map<string, Array<string>> = new Map();
    externalCalls.forEach((call) => {
      const prevCalls = new Set(groupped.get(call.program) || []);
      prevCalls.add(call.functionName);
      groupped.set(call.program, Array.from(prevCalls));
    });

    return Array.from(groupped.entries())
      .map((entry) =>
        GenerateTSImport(
          entry[1].map((transitionName) =>
            GetProgramTransitionsTypeName(entry[0], transitionName)
          ),
          `./${entry[0]}`
        )
      )
      .join('\n');
  }

  public generateTransitions() {
    // Import primitive schema type for Leo (leo-types.ts)

    let code =
      GenerateTSImport(['tx'], '@doko-js/core') +
      '\n' +
      (this.refl.customTypes.length > 0
        ? GenerateAsteriskTSImport(
            `../types/${this.refl.programName}`,
            'records'
          ) + '\n'
        : '') +
      this.generateExternalTransitionsImport(
        this.refl.functions.flatMap((fn) => fn.calls)
      ) +
      '\n\n';

    this.refl.functions
      .filter((fn) => fn.type === 'function')
      .forEach((fn) => {
        const tsReceiptTypeGenerator = new TSReceiptTypeGenerator();

        fn.calls.forEach((externalCall) => {
          tsReceiptTypeGenerator.addTransitionRef(
            externalCall.program,
            externalCall.functionName
          );
        });

        tsReceiptTypeGenerator.addTransition(
          this.refl.programName,
          fn.name,
          fn.outputs.map((output) => this.resolveOutputType(output))
        );

        code = code.concat(
          tsReceiptTypeGenerator.generate(
            GetProgramTransitionsTypeName(this.refl.programName, fn.name)
          )
        );
      });

    return code;
  }

  private generateExternalRecordImports(): string {
    const externalRecords = new Set(
      this.refl.functions.flatMap((f) => {
        return f.inputs
          .map((i) => i.val)
          .filter((i) => !i.endsWith('future'))
          .filter((input) => IsLeoExternalRecord(input));
      })
    );

    const imports = Array.from(externalRecords).flatMap<{
      type: string;
      from: string;
    }>((externalRecord) => {
      const parts = externalRecord.split('.aleo/');
      const programName = parts[0];
      const recordName = parts[1].replace('.record', '');

      return [
        { type: recordName, from: `./types/${programName}` },
        {
          type: GetConverterFunctionName(recordName, 'leo'),
          from: `./js2leo/${programName}`
        }
      ];
    });

    const grouppedImports: Map<string, Array<string>> = new Map();

    imports.forEach(({ type, from }) => {
      const arr = grouppedImports.get(from) || [];
      arr.push(type);
      grouppedImports.set(from, arr);
    });

    return Array.from(grouppedImports.entries())
      .map((entry) =>
        GenerateTSImport(
          entry[1],
          entry[0],
          entry[1].map((type) =>
            GetExternalRecordAlias(entry[0].split('/')[2], type)
          )
        )
      )
      .join('\n');
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

  private generateDecryptFunction(customType: StructDefinition) {
    // Eg if the input type is Token then
    // jsType : Token
    // leoType : TokenLeo
    const jsType = customType.name;
    const argName = toCamelCase(customType.name);

    const fnGenerator = new TSFunctionGenerator();

    // Add declaration statement
    fnGenerator.addStatement(
      `\tconst encodedRecord: string = typeof ${argName} === 'string'? ${argName}: ${argName}.value;\n`
    );
    fnGenerator.addStatement(
      '\tconst decodedRecord: string = PrivateKey.from_string(privateKey).to_view_key().decrypt(encodedRecord);\n'
    );
    fnGenerator.addStatement(
      `\tconst result: ${jsType} = get${jsType}(parseJSONLikeString(decodedRecord));\n`
    );

    // Add return statement
    fnGenerator.addStatement('\n\treturn result;\n');

    const fnName = 'decrypt' + jsType;
    const code = fnGenerator.generate(
      fnName,
      [
        { name: argName, type: `tx.RecordOutput<${jsType}> | string` },
        { name: 'privateKey', type: 'string' }
      ],
      jsType
    );

    return code;
  }

  // Generate TS to Leo converter functions
  public generateJSToLeo() {
    const generatedTypes: string[] = [];
    this.refl.customTypes.forEach((type) => {
      generatedTypes.push(type.name, `${type.name}Leo`);
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
    this.refl.customTypes.forEach((type) => {
      generatedTypes.push(type.name, `${type.name}Leo`);
    });

    let code = GenerateTSImport(
      generatedTypes,
      `../types/${this.refl.programName}`
    );
    code = code.concat(JS_FN_IMPORT, '\n\n');

    this.refl.customTypes.forEach((customType: StructDefinition) => {
      code = code.concat(
        this.generateConverterFunction(customType, STRING_JS),
        ...(customType.type === 'record'
          ? ['\n', this.generateDecryptFunction(customType)]
          : [])
      );
    });
    return code;
  }

  private generateTransitionFunction(
    func: FunctionDefinition,
    outUsedTypes: Set<string>
  ) {
    const fnGenerator = new TSFunctionGenerator()
      .setIsAsync(true)
      .setIsClassMethod(true)
      .setIsExported(false);

    const args: FunctionArgs[] = [];
    const localVariables: string[] = [];

    func.inputs.forEach((input) => {
      // Generate argument array
      const isExternalRecord = IsLeoExternalRecord(input.val);
      const leoType = FormatLeoDataType(input.val).split('.')[0];
      const jsType = isExternalRecord
        ? InferExternalRecordInputDataType(input.val)
        : InferJSDataType(leoType);

      // Create argument for each parameter of function
      const argName = input.key;
      args.push({ name: argName, type: jsType });

      // Can be anything but we just define it as something that ends with leo
      const localVariableName = `${argName}Leo`;
      localVariables.push(localVariableName);

      // We ignore the qualifier while generating conversion function
      // for transition function parameter
      let fnName = isExternalRecord
        ? GenerateExternalRecordConversionStatement(
            input.val,
            argName,
            STRING_LEO
          )
        : GenerateTypeConversionStatement(leoType, argName, STRING_LEO);

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

    /*
    fnGenerator.addStatement(
      '\t if(this.config.mode === "execute") return result; \n'
    );
    */

    // Ignore 'future' returntype for now
    const funcOutputs = func.outputs.filter(
      (output) => !output.includes('future')
    );

    const returnValues: { name: string; type: string }[] = [];
    if (funcOutputs.length > 0) {
      const createOutputVariable = (index: number) => `out${index}`;

      funcOutputs.forEach((output, index) => {
        const formattedOutput = FormatLeoDataType(output);
        const lhs = createOutputVariable(index);
        let input = `result.outputs[${index}]`;

        // cast non-custom datatype to string
        const type = formattedOutput.split('.')[0];
        if (IsLeoPrimitiveType(type)) input = `${input} as string`;

        const isRecordType = this.refl.isRecordType(type);
        const isExternalRecord =
          output.includes('.aleo/') && output.includes('.record');
        const externaleRecordParts = output
          .replace('.record', '')
          .split('.aleo/');
        const rhs = isExternalRecord
          ? GenerateExternalRecordConversionStatement(output, input, STRING_JS)
          : isRecordType
            ? `(this.config.mode===ExecutionMode.LeoRun) ? JSON.stringify(${input}) : ${input}`
            : GenerateTypeConversionStatement(
                formattedOutput,
                input,
                STRING_JS
              );
        fnGenerator.addStatement(`\tconst ${lhs} = ${rhs};\n`);
        if (this.refl.isCustomType(type)) {
          outUsedTypes.add(InferJSDataType(type));
        }
        returnValues.push({
          name: lhs,
          type: isExternalRecord
            ? `ExternalRecord<'${externaleRecordParts[0]}', '${externaleRecordParts[1]}'>`
            : isRecordType
              ? 'LeoRecord'
              : InferJSDataType(type)
        });
      });
    }
    // We return transaction object as last argument
    returnValues.push({
      name: 'result',
      type: `TransactionResponse & receipt.${GetProgramTransitionsTypeName(this.refl.programName, func.name)}`
    });

    // Format return statement and return type accordingly
    const variables = returnValues.map((returnValue) => returnValue.name);
    const types = returnValues.map((returnValues) => returnValues.type);
    fnGenerator.addStatement(`\t return [${variables.join(', ')}];\n`);
    const returnTypeString = `Promise<[${types.join(', ')}]>`;
    return fnGenerator.generate(func.name, args, returnTypeString);
  }

  private generateMappingFunction(
    mapping: MappingDefinition,
    usedTypes: Set<string>
  ) {
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
      fnName = `js2leo.json(${fnName})`;
      // @NOTE can we use custom type as key for mapping?
      usedTypes.add(jsType);
    }

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
    if (this.refl.isCustomType(leoReturnType)) usedTypes.add(returnType);

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

    const usedTypesSet = new Set<string>();
    classGenerator.addMethod(
      `constructor(config: Partial<ContractConfig> = {mode: ExecutionMode.LeoRun}) {
        super({
          ...config,
          appName: '${programName}',
          networkMode: config.networkMode, 
          fee: '0.01'
          contractPath: '${this.programParams?.isImportedAleo ? IMPORTS_PATH : PROGRAM_DIRECTORY}${programName}',
          isImportedAleo: ${Boolean(this.programParams?.isImportedAleo)}
      });
  }\n`
    );
    //           networkMode: config.networkName === 'testnet' ? 1 : 0, 
    this.refl.functions.forEach((func) => {
      if (func.type === 'function') {
        classGenerator.addMethod(
          this.generateTransitionFunction(func, usedTypesSet)
        );
      }
    });
    this.refl.mappings.forEach((mapping) => {
      classGenerator.addMethod(
        this.generateMappingFunction(mapping, usedTypesSet)
      );
    });

    const usedTypes = Array.from(usedTypesSet);
    let code = '';
    if (usedTypes.length > 0) {
      code = code.concat(GenerateTSImport(usedTypes, `./types/${programName}`));
      let usedFunctions = usedTypes.map((type) =>
        GetConverterFunctionName(type, STRING_LEO)
      );
      code = code.concat(
        GenerateTSImport(usedFunctions, `./js2leo/${programName}`)
      );

      usedFunctions = usedTypes.map((type) =>
        GetConverterFunctionName(type, STRING_JS)
      );
      code = code.concat(
        GenerateTSImport(usedFunctions, `./leo2js/${programName}`)
      );
    }
    code = code.concat(this.generateExternalRecordImports(), '\n');

    code = code.concat(
      GenerateTSImport(
        [
          'ContractConfig',
          'zkGetMapping',
          'LeoAddress',
          'LeoRecord',
          'js2leo',
          'leo2js',
          'ExternalRecord',
          'ExecutionMode',
          'ExecutionContext',
          'CreateExecutionContext',
          'TransactionResponse'
        ],
        '@doko-js/core'
      ),
      GenerateTSImport(['BaseContract'], '../../contract/base-contract'),
      GenerateAsteriskTSImport(`./transitions/${programName}`, 'receipt'),
      '\n\n'
    );
    return code.concat(
      classGenerator.generate(GetContractClassName(programName))
    );
  }
}

export { Generator };
