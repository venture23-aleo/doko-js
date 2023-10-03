"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAleo = void 0;
const tokenizer_1 = require("./tokenizer");
const parser_1 = require("./parser");
const fs_1 = __importDefault(require("fs"));
// Read file
function parseAleo() {
    try {
        const data = fs_1.default.readFileSync("contracts/build/main.aleo", "utf-8");
        const tokenizer = new tokenizer_1.Tokenizer(data);
        const aleoReflection = new parser_1.Parser(tokenizer).parse();
        fs_1.default.writeFileSync("./output.json", JSON.stringify({
            mappings: aleoReflection.mappings,
            customTypes: aleoReflection.customTypes,
            functions: aleoReflection.functions,
        }));
        return aleoReflection;
    }
    catch (error) {
        console.log(error);
    }
}
exports.parseAleo = parseAleo;
//# sourceMappingURL=index.js.map