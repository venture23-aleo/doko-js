enum TokenType {
  UNKNOWN = 0,
  KEYWORD = 3,
  IDENTIFIER = 4,
}

const DECLARATION_KEYWORDS = {
  STRUCT: "struct",
  FUNCTION: "function",
  FINALIZE: "finalize",
  RECORD: "record",
  CLOSURE: "closure",
  MAPPING: "mapping",
};

const KEYWORDS: Record<string, string> = {
  INPUT: "input",
  OUTPUT: "output",
  ADD: "add",
  KEY: "key",
  VALUE: "value",
  LEFT: "left",
  RIGHT: "right",
  ...DECLARATION_KEYWORDS,
};

const KeyWordSet = new Set<string>(Object.values(KEYWORDS));

interface TokenInfo {
  type: TokenType;
  // Only useful for data type for now
  value: string;
}

type Identifier = string;
type FunctionName = string;
type TypeName = string;
type DataType = string;
export type KeyVal<K, V> = { key: K; val: V };

interface StructDefinition {
  name: string;
  type: string;
  members: Array<KeyVal<Identifier, DataType>>;
}

interface FunctionDefinition {
  name: string;
  type: string;
  inputs: Array<KeyVal<Identifier, DataType>>;
  output: DataType;
}

interface MappingDefinition {
  name: string;
  left: DataType;
  right: DataType;
}

export {
  TokenInfo,
  TokenType,
  Identifier,
  FunctionName,
  TypeName,
  DataType,
  StructDefinition,
  FunctionDefinition,
  MappingDefinition,
  KeyWordSet,
  KEYWORDS,
};
