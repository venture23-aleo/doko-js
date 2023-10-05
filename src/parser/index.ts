import { Tokenizer } from './tokenizer';
import { Parser, AleoReflection } from './parser';
import { TSInterfaceGenerator } from '../generator/ts-interface-generator';

import fs from 'fs';
import { ConvertToJSType, StructDefinition } from '../utils/aleo-utils';

function inferDataType(type: string, aleoReflection: AleoReflection): string {
  // Strip any scope qualifier (private, public)
  type = type.split('.')[0];

  // Check if it is a custom type
  const found = aleoReflection.customTypes.find(
    (customTypes) => customTypes.name === type
  );
  if (found) return type;

  // Check if it is a primitive type
  const jsType = ConvertToJSType(type);
  if (jsType) return jsType;
  else throw new Error(`Undeclared type encountered: ${type}`);
}

// Read file
function parseAleo() {
  try {
    console.log('Parsing aleo file contracts/build/main.aleo');
    const data = fs.readFileSync('contracts/build/main.aleo', 'utf-8');
    const tokenizer = new Tokenizer(data);
    const aleoReflection = new Parser(tokenizer).parse();

    console.log('Generating TS interface file generated/aleo-interface.ts');
    const tsFileStream = fs.createWriteStream(
      'generated/aleo-interface.ts',
      'utf-8'
    );

    aleoReflection.customTypes.forEach((customType: StructDefinition) => {
      const generator = new TSInterfaceGenerator();
      customType.members.forEach((member) => {
        generator.addField(
          member.key,
          inferDataType(member.val, aleoReflection)
        );
      });
      tsFileStream.write(generator.generate(customType.name) + '\n\n');
    });

    tsFileStream.close();
    console.log('Interface File Generated');
    /*
    fs.writeFileSync(
      './output.json',
      JSON.stringify({
        mappings: aleoReflection.mappings,
        customTypes: aleoReflection.customTypes,
        functions: aleoReflection.functions
      })
    );*/
    return aleoReflection;
  } catch (error) {
    console.log(error);
  }
}

export { parseAleo };
