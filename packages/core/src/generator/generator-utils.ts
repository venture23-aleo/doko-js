import {
  ConvertToJSType,
  GetLeoArrTypeAndSize,
  getNestedType,
  IsLeoArray,
  IsLeoPrimitiveType,
  IsLeoExternalRecord
} from '@/utils/aleo-utils';
import { GetConverterFunctionName } from './leo-naming';
import { DokoJSError, ERRORS } from '@doko-js/utils';
import { STRING_JS } from './string-constants';

export function InferJSDataType(type: string): string {
  if (
    IsLeoPrimitiveType(type) ||
    IsLeoArray(type) ||
    IsLeoExternalRecord(type)
  ) {
    const tsType = ConvertToJSType(type);
    if (tsType) return tsType;
    else
      throw new DokoJSError(ERRORS.ARTIFACTS.UNDECLARED_TYPE, {
        value: type
      });
  }
  return type;
}

export function GenerateAsteriskTSImport(location: string, alias: string) {
  return `import * as ${alias} from "${location}";`;
}

export function GenerateTSImport(
  types: string[],
  location: string,
  aliases?: Array<string | null>
) {
  if (aliases) {
    if (aliases.length !== types.length) {
      throw new DokoJSError(ERRORS.ARTIFACTS.INVALID_ALIAS_COUNT, {
        expected: types.length,
        received: aliases.length
      });
    }
    types = types.map((type, index) =>
      aliases[index] !== null ? `${type} as ${aliases[index]}` : type
    );
  }
  // Create import statement for custom types
  return `import {\n ${types.join(',\n')}} from "${location}";`;
}

// Generate statement to convert type back and forth
// Eg: private(js2leo.u32(count))
// type: u32.private
// inputField: input to u32 function
// conversionTo: js or leo
export function GenerateTypeConversionStatement(
  leoType: string,
  inputField: string,
  conversionTo: string
) {
  // Split qualifier private/public
  const [type, qualifier] = leoType.split('.');

  // Determine member conversion function
  const conversionFnName = GetConverterFunctionName(type, conversionTo);

  const namespace = conversionTo === 'js' ? 'leo2js' : 'js2leo';

  let fn = `${conversionFnName}(${inputField})`;

  if (IsLeoArray(type)) {
    const [nestedType, depth] = getNestedType(type);
    const conversionFn = IsLeoPrimitiveType(nestedType)
      ? `${namespace}.${nestedType}`
      : GetConverterFunctionName(nestedType, conversionTo);
    if (depth === 1) {
      fn = `${namespace}.${conversionFnName}(${inputField}, ${conversionFn})`;
      if(qualifier && conversionTo === 'leo') {
        fn = `${namespace}.${conversionFnName}(${fn}, ${namespace}.${qualifier}Field)`;
      }
    } else {
      for (let i = 1; i < depth; i++) {
        inputField += `.map(element${i} =>`;
      }
      if(qualifier && conversionTo === 'leo') {
        fn = `${namespace}.${conversionFnName}(${namespace}.${conversionFnName}(element${depth - 1}, ${conversionFn}), ${namespace}.${qualifier}Field)`;
      } else {
        inputField += ` ${namespace}.${conversionFnName}(element${depth - 1}, ${conversionFn})`;
      }
      for (let i = 1; i < depth; i++) {
        inputField += ')';
      }
      fn = inputField;
    }
    // if(qualifier) {
    //   fn = `${namespace}.${conversionFnName}(${fn}, ${namespace}.${qualifier}Field)`;
    // }
  }
  // if this is not a custom type we have to use the
  // conversion function from namespace
  else if (IsLeoPrimitiveType(type)) {
    fn = `${namespace}.${fn}`;

    if (conversionTo === 'leo') {
      if (qualifier) {
        fn = `${namespace}.${qualifier}Field(${fn})`;
      }
    }
  }

  return fn;
}

// Return list of function involved in conversion of the given type
export function GetTypeConversionFunctionsJS(leoType: string) {
  // Split qualifier private/public
  const [type, qualifier] = leoType.split('.');

  const functions = [];
  // Determine member conversion function
  const namespace = 'leo2js';
  const conversionFnName = GetConverterFunctionName(type, STRING_JS);
  const isArray = IsLeoArray(type);

  const isLeoType = isArray || IsLeoPrimitiveType(type);
  functions.push(
    isLeoType ? `${namespace}.${conversionFnName}` : conversionFnName
  );

  if (isArray) {
    // Pass additional conversion function
    const [dataType, size] = GetLeoArrTypeAndSize(type);
    functions.push(`${namespace}.${dataType}`);
  }
  return functions;
}

export function InferExternalRecordInputDataType(recordType: string) {
  const parts = recordType.replace('.record', '').split('.aleo/');
  const program = parts[0];
  const record = parts[1];

  return `${program}_${record}`;
}

export function GenerateExternalRecordConversionStatement(
  recordType: string,
  value: string,
  converstionTo: string
) {
  const parts = recordType.replace('.record', '').split('.aleo/');
  const program = parts[0];
  const record = parts[1];

  if (converstionTo === 'js') {
    return ['leo2js.externalRecord', `'${program}.aleo/${record}'`];
  } else {
    return `js2leo.json(${program}_${GetConverterFunctionName(record, 'leo')}(${value}))`;
  }
}

// Resolve import return types
// Some return types are referenced by import file
// Eg: token.leo/token.record
export function FormatLeoDataType(type: string) {
  if (type.includes('/')) type = type.split('/')[1];
  return type;
}

export function GenerateZkRunCode(transitionName: string) {
  return `const result = await this.ctx.execute('${transitionName}', params);\n`;
}

export function GenerateZkMappingCode(mappingName: string) {
  return `\tconst result = await zkGetMapping(
        this.config,
        '${mappingName}',
        params[0],
      );\n`;
}
