import { Tokenizer } from "./tokenizer";
import { Parser } from "./parser";

import fs from "fs";

// Read file
function parseAleo() {
  try {
    const data = fs.readFileSync("contracts/build/main.aleo", "utf-8");
    const tokenizer = new Tokenizer(data);
    const aleoReflection = new Parser(tokenizer).parse();

    fs.writeFileSync(
      "./output.json",
      JSON.stringify({
        mappings: aleoReflection.mappings,
        customTypes: aleoReflection.customTypes,
        functions: aleoReflection.functions,
      })
    );
    return aleoReflection;
  } catch (error) {
    console.log(error);
  }
}

export { parseAleo };
