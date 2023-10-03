import { Tokenizer } from "./tokenizer";
import { Parser } from "./parser";
import { TSInterfaceGenerator } from "../generator/ts-interface-generator";

import fs from "fs";
import { StructDefinition } from "../utils/aleo-utils";

// Read file
function parseAleo() {
  try {
    const data = fs.readFileSync("contracts/build/main.aleo", "utf-8");
    const tokenizer = new Tokenizer(data);
    const aleoReflection = new Parser(tokenizer).parse();

    const tsFileStream = fs.createWriteStream(
      "generated/aleo-interface.ts",
      "utf-8"
    );

    aleoReflection.customTypes.forEach((customType: StructDefinition) => {
      const tsCode = TSInterfaceGenerator.generate(customType);
      tsFileStream.write(tsCode + "\n\n");
    });
    tsFileStream.close();

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
