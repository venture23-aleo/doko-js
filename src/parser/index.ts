import { Tokenizer } from './tokenizer';
import { Parser } from './parser';

import fs from 'fs';
import { Generator } from '../generator/generator';

const GENERATE_FILE_OUT_DIR = 'generated/';
const PROGRAM_DIRECTORY = './programs/';

// Read file
async function parseAleo(programFolder: string, programName: string) {
  try {
    // Check if build directory exists
    if (!fs.existsSync(programFolder + 'build')) return;

    const filename = programFolder + 'build/main.aleo';
    console.log(`Parsing program[${programName}, ${filename}]`);
    const data = fs.readFileSync(filename, 'utf-8');
    const tokenizer = new Tokenizer(data);
    const aleoReflection = new Parser(tokenizer).parse();

    if (aleoReflection.customTypes.length === 0) return;

    // Create Output Directory
    const outputFolder = GENERATE_FILE_OUT_DIR + programName + '/';
    if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

    const generator = new Generator(aleoReflection);
    generator
      .setDirectory(outputFolder)
      .setTSToLeoFilename('types.ts')
      .setTSToLeoFilename('ts2leo.ts')
      .setLeoToTSFilename('leo2ts.ts');
    return generator.generate();
  } catch (error) {
    console.log(error);
  }
}

async function compilePrograms() {
  try {
    const contents = fs.readdirSync(PROGRAM_DIRECTORY);
    const folders = contents.filter((name) =>
      fs.statSync(PROGRAM_DIRECTORY + name).isDirectory()
    );

    // Create Output Directory
    if (!fs.existsSync(GENERATE_FILE_OUT_DIR))
      fs.mkdirSync(GENERATE_FILE_OUT_DIR);

    await Promise.all(
      folders.map((folder) =>
        parseAleo(PROGRAM_DIRECTORY + folder + '/', folder)
      )
    );

    console.log('Copying leo-types.ts file ...');
    fs.copyFileSync(
      './src/utils/leo-types.ts',
      GENERATE_FILE_OUT_DIR + 'leo-types.ts'
    );
    console.log('Copying js-types.ts file ...');
    fs.copyFileSync(
      './src/utils/ts-types.ts',
      GENERATE_FILE_OUT_DIR + 'ts-types.ts'
    );
  } catch (error) {
    console.log(error);
  }
}

export { compilePrograms };
