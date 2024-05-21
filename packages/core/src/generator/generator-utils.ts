import {
  ConvertToJSType,
  GetLeoArrTypeAndSize,
  IsLeoArray,
  IsLeoPrimitiveType,
  IsLeoExternalRecord
} from '@/utils/aleo-utils';
import { GetConverterFunctionName } from './leo-naming';

export function InferJSDataType(type: string): string {
  if (
    IsLeoPrimitiveType(type) ||
    IsLeoArray(type) ||
    IsLeoExternalRecord(type)
  ) {
    const tsType = ConvertToJSType(type);
    if (tsType) return tsType;
    else throw new Error(`Undeclared type encountered: ${type}`);
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
      throw new Error('Invalid aliases count');
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
    return `new ExternalRecord('${program}.aleo/${record}')`;
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
  /* return `\tconst result = await zkRun({
        config: this.config,
        transition: '${transitionName}',
        params,
      });\n`;
  */
    return `const result = await this.ctx.execute('${transitionName}', params);`

}

export function GenerateZkMappingCode(mappingName: string) {
  return `\tconst result = await zkGetMapping({
        config: this.config,
        transition: '${mappingName}',
        params,
      });\n`;
}
