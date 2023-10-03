"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const utils_1 = require("./utils");
class AleoReflection {
    constructor() {
        this.customTypes = new Array();
        this.functions = new Array();
        this.mappings = new Array();
    }
}
class Parser {
    constructor(tokenizer) {
        this.tokenizer = tokenizer;
    }
    parseExpression() {
        const identifier = this.tokenizer.readToken().value;
        // Eat 'as' string
        this.tokenizer.readToken();
        const type = this.tokenizer.readToken().value;
        return { key: identifier, val: type };
    }
    // Parse struct declaration
    parseStruct(token) {
        const structName = this.tokenizer.readToken().value;
        const fields = new Array();
        // Eat the left parenthesis
        this.tokenizer.readToken();
        // Parse until we reach right parenthesis
        while (this.tokenizer.tryReadToken().value !== "}") {
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
    parseMapping(token) {
        const mappingName = this.tokenizer.readToken().value;
        const fields = new Array();
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
            right: rightDeclaration.val,
        };
    }
    parseFunctionPrototype(token) {
        const fnName = this.tokenizer.readToken().value;
        const inputs = new Array();
        const output = "void";
        // Eat the left parenthesis
        this.tokenizer.readToken();
        while (true) {
            const token = this.tokenizer.tryReadToken();
            // @TODO find proper delimeter
            if (token.value != utils_1.KEYWORDS.INPUT)
                break;
            // Read 'input' token
            this.tokenizer.readToken();
            // Parse declaration
            inputs.push(this.parseExpression());
        }
        return { name: fnName, type: token.value, inputs, output };
    }
    parseFunction(token) {
        const functionDef = this.parseFunctionPrototype(token);
        // @TODO parse rest of the file
        while (this.tokenizer.tryReadToken().value !== "}") {
            // Eat the whole function body
            const tk = this.tokenizer.readToken();
            if (tk.value === utils_1.KEYWORDS.OUTPUT) {
                functionDef.output = this.parseExpression().val;
            }
        }
        // Eat right parenthesis
        this.tokenizer.readToken();
        return functionDef;
    }
    parse() {
        const aleoReflection = new AleoReflection();
        while (this.tokenizer.hasToken()) {
            const token = this.tokenizer.readToken();
            switch (token.type) {
                case utils_1.TokenType.UNKNOWN:
                    break;
                case utils_1.TokenType.KEYWORD:
                    if (token.value === utils_1.KEYWORDS.STRUCT || token.value == utils_1.KEYWORDS.RECORD)
                        aleoReflection.customTypes.push(this.parseStruct(token));
                    else if (token.value === utils_1.KEYWORDS.FUNCTION ||
                        token.value === utils_1.KEYWORDS.FINALIZE ||
                        token.value === utils_1.KEYWORDS.CLOSURE)
                        aleoReflection.functions.push(this.parseFunction(token));
                    else if (token.value === utils_1.KEYWORDS.MAPPING)
                        aleoReflection.mappings.push(this.parseMapping(token));
                    else
                        console.warn("[Warning] Unparsed keyword: ", token.value);
                    break;
            }
        }
        return aleoReflection;
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map