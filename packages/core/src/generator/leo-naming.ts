import {
  IsLeoArray,
  IsLeoPrimitiveType,
  trimAleoPostfix,
  getNestedType,
  extractArraySizes
} from '@/utils/aleo-utils';
import { capitalize } from '@doko-js/utils';

// Creates leo schema name from type
// Eg. if schema for struct Token{} is to be generated
// it generate it as `leoTokenSchema'
export function GenerateLeoSchemaName(typeName: string) {
  if (IsLeoArray(typeName)) {
    const [nestedType] = getNestedType(typeName);
    const sizes = extractArraySizes(typeName);
    let schema = `leo${capitalize(nestedType)}Schema`;
    for (const size of sizes) {
      schema = `z.array(${schema}).length(${size})`;
    }
    return schema
  }
  return `leo${capitalize(typeName)}Schema`;
}

// It just declares alias for a given custom type and alias
export function GenerateLeoSchemaAliasDeclaration(
  leoSchemaAlias: string,
  customType: string
) {
  const leoSchemaName = GenerateLeoSchemaName(customType);
  return (
    `export type ${leoSchemaAlias} = z.infer<typeof ${leoSchemaName}>;` + '\n\n'
  );
}
// Create a converter function name string from dataType
// includes custom types too
export function GetConverterFunctionName(type: string, conversionTo: string) {
  if (IsLeoPrimitiveType(type)) return type;
  else if (IsLeoArray(type)) return 'array';
  return conversionTo == 'js' ? `get${type}` : `get${type}Leo`;
}

export function GetLeoTypeNameFromJS(jsType: string) {
  return jsType + 'Leo';
}

export function GetLeoMappingFuncName(mappingName: string) {
  return /*'mapping_' + */ mappingName;
}

export function GetContractClassName(programName: string) {
  return `${capitalize(programName)}Contract`;
}

export function GetProgramTransitionsTypeName(
  programName: string,
  functionName: string
) {
  return `${capitalize(trimAleoPostfix(programName))}${capitalize(functionName)}Transition`;
}

export function GetExternalRecordAlias(
  programName: string,
  recordName: string
) {
  return `${programName}_${recordName}`;
}
