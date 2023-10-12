import { Tokenizer } from './tokenizer';
import { Parser } from './parser';

import fs from 'fs';
import { Generator } from '../generator/generator';


const GENERATE_FILE_OUT_DIR = 'generated/'

// Read file
async function parseAleo() {
  try {
    console.log('Parsing aleo file contracts/build/main.aleo');
    const data = fs.readFileSync('contracts/build/main.aleo', 'utf-8');
    const tokenizer = new Tokenizer(data);
    const aleoReflection = new Parser(tokenizer).parse();

    if (!fs.existsSync(GENERATE_FILE_OUT_DIR))
      fs.mkdirSync(GENERATE_FILE_OUT_DIR);

    console.log('Copying leo-types.ts file ...');
    fs.copyFileSync('./src/utils/leo-types.ts', GENERATE_FILE_OUT_DIR + 'leo-types.ts');
    console.log('Copying js-types.ts file ...');
    fs.copyFileSync('./src/utils/js-types.ts', GENERATE_FILE_OUT_DIR + 'js-types.ts');


    const generator = new Generator(aleoReflection);
    generator.setJSToLeoFilename('types.ts').
      setJSToLeoFilename('js2leo.ts');
    return generator.generate(GENERATE_FILE_OUT_DIR);
  } catch (error) {
    console.log(error);
  }
}

export { parseAleo };
