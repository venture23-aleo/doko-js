"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYWORDS = exports.KeyWordSet = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["UNKNOWN"] = 0] = "UNKNOWN";
    TokenType[TokenType["KEYWORD"] = 3] = "KEYWORD";
    TokenType[TokenType["IDENTIFIER"] = 4] = "IDENTIFIER";
})(TokenType || (exports.TokenType = TokenType = {}));
const DECLARATION_KEYWORDS = {
    STRUCT: "struct",
    FUNCTION: "function",
    FINALIZE: "finalize",
    RECORD: "record",
    CLOSURE: "closure",
    MAPPING: "mapping",
};
const KEYWORDS = Object.assign({ INPUT: "input", OUTPUT: "output", ADD: "add", KEY: "key", VALUE: "value", LEFT: "left", RIGHT: "right" }, DECLARATION_KEYWORDS);
exports.KEYWORDS = KEYWORDS;
const KeyWordSet = new Set(Object.values(KEYWORDS));
exports.KeyWordSet = KeyWordSet;
//# sourceMappingURL=utils.js.map