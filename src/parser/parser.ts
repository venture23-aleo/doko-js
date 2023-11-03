import {
  StructDefinition,
  FunctionDefinition,
  TokenInfo,
  KeyVal,
  Identifier,
  DataType,
  KEYWORDS,
  TokenType,
  MappingDefinition
} from '../utils/aleo-utils';

import { Tokenizer } from './tokenizer';

class AleoReflection {
  programName = '';
  customTypes = new Array<StructDefinition>();
  functions = new Array<FunctionDefinition>();
  mappings = new Array<MappingDefinition>();
  env?: Map<string, string>;

  isCustomType(type: string) {
    return (
      this.customTypes.find((customType) => customType.name === type) !=
      undefined
    );
  }
}

class Parser {
  private tokenizer: Tokenizer;

  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer;
  }

  private parseExpression(): KeyVal<Identifier, DataType> {
    const identifier = this.tokenizer.readToken().value;

    // Eat 'as' string
    this.tokenizer.readToken();

    const type = this.tokenizer.readToken().value;
    return { key: identifier, val: type };
  }

  // Parse struct declaration
  private parseStruct(token: TokenInfo): StructDefinition {
    const structName = this.tokenizer.readToken().value;

    const fields = new Array<KeyVal<Identifier, DataType>>();

    // Eat the left parenthesis
    this.tokenizer.readToken();

    // Parse until we reach right parenthesis
    while (this.tokenizer.tryReadToken().value !== '}') {
      // Parse declaration
      fields.push(this.parseExpression());
    }

    // Eat right parenthesis
    this.tokenizer.readToken();

    if (fields.length === 0)
      console.warn(`[Warning] Struct ${structName} is empty.`);

    return { name: structName, type: token.value, members: fields };
  }

  // Parse mapping declaration
  private parseMapping(token: TokenInfo): MappingDefinition {
    const mappingName = this.tokenizer.readToken().value;

    // Eat the left parenthesis
    this.tokenizer.readToken();

    // Eat 'key' keyword
    this.tokenizer.readToken();

    // Parse left declaration
    const leftDeclaration = this.parseExpression();

    // Eat 'value' keyword
    this.tokenizer.readToken();

    // Parse right declaration
    const rightDeclaration = this.parseExpression();

    return {
      name: mappingName,
      left: leftDeclaration.val,
      right: rightDeclaration.val
    };
  }

  private parseFunctionPrototype(token: TokenInfo): FunctionDefinition {
    const fnName = this.tokenizer.readToken().value;
    const inputs = new Array<KeyVal<Identifier, DataType>>();
    const output = 'void';

    // Eat the left parenthesis
    this.tokenizer.readToken();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const token = this.tokenizer.tryReadToken();

      if (token.value != KEYWORDS.INPUT) break;

      // Eat 'input' token
      this.tokenizer.readToken();

      // Parse declaration
      inputs.push(this.parseExpression());
    }
    return { name: fnName, type: token.value, inputs, output };
  }

  private parseFunction(token: TokenInfo): FunctionDefinition {
    const functionDef = this.parseFunctionPrototype(token);

    while (this.tokenizer.tryReadToken().value !== '}') {
      // Eat the whole function body
      const tk = this.tokenizer.readToken();
      if (tk.value === KEYWORDS.OUTPUT) {
        functionDef.output = this.parseExpression().val;
      }
    }

    // Eat right parenthesis
    this.tokenizer.readToken();
    return functionDef;
  }

  parse(): AleoReflection {
    const aleoReflection = new AleoReflection();

    while (this.tokenizer.hasToken()) {
      const token = this.tokenizer.readToken();
      switch (token.type) {
        case TokenType.UNKNOWN:
          break;
        case TokenType.KEYWORD:
          if (token.value === KEYWORDS.STRUCT || token.value == KEYWORDS.RECORD)
            aleoReflection.customTypes.push(this.parseStruct(token));
          else if (
            token.value === KEYWORDS.FUNCTION ||
            token.value === KEYWORDS.FINALIZE ||
            token.value === KEYWORDS.CLOSURE
          )
            aleoReflection.functions.push(this.parseFunction(token));
          else if (token.value === KEYWORDS.MAPPING)
            aleoReflection.mappings.push(this.parseMapping(token));
          else if (token.value === KEYWORDS.PROGRAM) {
            const programNameWithExt = this.tokenizer.readToken().value;
            aleoReflection.programName = programNameWithExt.split('.aleo')[0];
          } else console.warn('[Warning] Unparsed keyword: ', token.value);
          break;
      }
    }

    return aleoReflection;
  }
}

export { Parser, AleoReflection };
