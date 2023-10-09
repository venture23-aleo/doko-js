import { Tokenizer } from './tokenizer';
import { Parser, AleoReflection } from './parser';
import { TSInterfaceGenerator } from '../generator/ts-interface-generator';
import { ConvertToJSType, StructDefinition } from '../utils/aleo-utils';
import { ZodObjectGenerator } from '../generator/zod-object-generator';

import fs from 'fs';

const GENERATE_FILE_OUT_DIR = 'generated/'

function inferDataType(type: string, aleoReflection: AleoReflection): string {
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

// Create type files and copy 'leo-types' file to generated folder
async function createTypeFile(aleoReflection: AleoReflection) {

  const outputFile = `${GENERATE_FILE_OUT_DIR}aleo-interface.ts`
  console.log(`Generating TS interface file ${outputFile}`);
  const tsFileStream = fs.createWriteStream(
    outputFile,
    'utf-8'
  );

  // Write import statement
  tsFileStream.write(`import { z } from "zod";
import { 
  leoU8Schema,
  leoU16Schema,
  leoU32Schema,
  leoU128Schema,
  leoFieldSchema,
  leoAddressSchema,
  leoBooleanSchema,
  leoGroupSchema,
  leoRecordSchema,
} from "./leo-types"; \n\n`);

  aleoReflection.customTypes.forEach((customType: StructDefinition) => {
    // Create Typescript/ Zod interface for custom types
    const tsInterfaceGenerator = new TSInterfaceGenerator();
    const zodInterfaceGenerator = new ZodObjectGenerator();
    const Capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

    customType.members.forEach((member) => {
      // Strip any scope qualifier (private, public)
      const type = member.val.split('.')[0];
      tsInterfaceGenerator.addField(
        member.key,
        inferDataType(type, aleoReflection)
      );
      zodInterfaceGenerator.addField(member.key, `leo${Capitalize(type)}Schema`);
    });

    tsFileStream.write(tsInterfaceGenerator.generate(customType.name) + '\n\n');
    tsFileStream.write(zodInterfaceGenerator.generate(`leo${customType.name}Schema`) + '\n\n');
  });

  tsFileStream.close();

  await new Promise((resolve, reject) => {
    console.log('Interface File Generated');
    tsFileStream.on('close', resolve);
    tsFileStream.on('error', reject);
  });
}

// Read file
async function parseAleo() {
  try {
    console.log('Parsing aleo file contracts/build/main.aleo');
    const data = fs.readFileSync('contracts/build/main.aleo', 'utf-8');
    const tokenizer = new Tokenizer(data);
    const aleoReflection = new Parser(tokenizer).parse();

    await createTypeFile(aleoReflection);

    console.log('Copying leo-types.ts file ...');
    fs.copyFileSync('./src/utils/leo-types.ts', GENERATE_FILE_OUT_DIR + 'leo-types.ts');

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
