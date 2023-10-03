"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = void 0;
const utils_1 = require("./utils");
class Tokenizer {
    constructor(data) {
        const formattedCode = this.convertIndentToBlock(data);
        // Tokenize by splitting it using whitespace
        this.data = formattedCode.split(/\s+/);
    }
    // Convert indentation to block of {}
    // No multilevel block, only single level block are present in .aleo
    // Since the .aleo is guaranteed to have a single indentation level only
    // we use it to generate the braces to mark the beginning and end of the
    // declaration. This will help us significantly later on
    convertIndentToBlock(data) {
        // Split by newline and remove empty character
        const lines = data.split("\n").filter((s) => s != "");
        let formattedCode = [];
        let block = false;
        lines.forEach((line) => {
            // Declaration of function, struct, record etc always ends with ':' in the end
            const isDeclaration = line.at(line.length - 1) === ":";
            if (isDeclaration) {
                if (block)
                    formattedCode.push("}");
                block = true;
                // Replace declaration ":" by "{" to mark beginning of block
                line = line.replace(":", " {");
            }
            formattedCode.push(line);
        });
        // Add one at the last to mark end
        formattedCode.push("}");
        return formattedCode.join("\n");
    }
    getTokenInfo(token) {
        if (utils_1.KeyWordSet.has(token))
            return utils_1.TokenType.KEYWORD;
        // Regex for valid identifier
        else if (token === null || token === void 0 ? void 0 : token.match("^[_a-z]\\w*$"))
            return utils_1.TokenType.IDENTIFIER;
        return utils_1.TokenType.UNKNOWN;
    }
    readToken() {
        var _a;
        // Remove semicolon and colon
        const token = (_a = this.data.shift()) === null || _a === void 0 ? void 0 : _a.replace(/[;:]/g, "");
        if (!token || token.length == 0)
            return { type: utils_1.TokenType.UNKNOWN, value: "" };
        return { type: this.getTokenInfo(token), value: token };
    }
    // Try reading without removing it
    // This can be used to determine the termination of the function or struct declaration
    tryReadToken() {
        const token = this.data[0];
        return { type: this.getTokenInfo(token), value: token };
    }
    hasToken() {
        return this.data.length > 0;
    }
}
exports.Tokenizer = Tokenizer;
//# sourceMappingURL=tokenizer.js.map