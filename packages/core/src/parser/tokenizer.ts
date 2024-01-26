import { TokenInfo, TokenType, KeyWordSet } from '@/utils/aleo-utils';

class Tokenizer {
  private data: string[];

  constructor(data: string) {
    const formattedCode = this.convertIndentToBlock(data);

    // Tokenize by splitting it using whitespace
    // But exclude anything between square bracket for handling array
    this.data = formattedCode.split(/\s+(?!\w+\])/g);
  }

  // Convert indentation to block of {}
  // No multilevel block, only single level block are present in .aleo
  // Since the .aleo is guaranteed to have a single indentation level only
  // we use it to generate the braces to mark the beginning and end of the
  // declaration. This will help us significantly later on
  private convertIndentToBlock(data: string) {
    // Split by newline and remove empty character
    const lines = data.split('\n').filter((s) => s != '');

    const formattedCode: string[] = [];
    let block = false;
    lines.forEach((line: string) => {
      // Declaration of function, struct, record etc always ends with ':' in the end
      const isDeclaration = line.at(line.length - 1) === ':';
      if (isDeclaration) {
        if (block) formattedCode.push('}');
        block = true;

        // Replace declaration ":" by "{" to mark beginning of block
        line = line.replace(':', ' {');
      }
      formattedCode.push(line);
    });

    // Add one at the last to mark end
    formattedCode.push('}');
    return formattedCode.join('\n');
  }

  private getTokenInfo(token: string): TokenType {
    if (KeyWordSet.has(token)) return TokenType.KEYWORD;
    // Regex for valid identifier
    else if (token?.match('^[_a-z]\\w*$')) return TokenType.IDENTIFIER;
    return TokenType.UNKNOWN;
  }

  readToken(): TokenInfo {
    // Remove semicolon and colon
    const token = this.data.shift()?.replace(/[;:]/g, '');
    if (!token || token.length == 0)
      return { type: TokenType.UNKNOWN, value: '' };

    return { type: this.getTokenInfo(token), value: token };
  }

  // Try reading without removing it
  // This can be used to determine the termination of the function or struct declaration
  tryReadToken(): TokenInfo {
    const token = this.data[0];
    return { type: this.getTokenInfo(token), value: token };
  }

  hasToken() {
    return this.data.length > 0;
  }
}

export { Tokenizer };
