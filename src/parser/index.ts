import { Tokenizer } from './tokenizer';
import { Parser } from './parser';

import fs from 'fs';
import { Generator } from '../generator/generator';

const GENERATE_FILE_OUT_DIR = 'artifacts/js/';
const PROGRAM_DIRECTORY = 'artifacts/leo/';

async function writeToFile(filename: string, data: string) {
  try {
    const fileStream = fs.createWriteStream(filename, 'utf-8');
    fileStream.write(data);
    fileStream.close();
    return new Promise((resolve, reject) => {
      console.log('Generated file:', filename);
      fileStream.on('error', reject);
      fileStream.on('close', resolve);
    });
  } catch (error) {
    console.log(error);
  }
}

function generateImportForIndexFile(
  generatedTypes: string[],
  filename: string
) {
  const typeString = generatedTypes.join(', ');
  return `import {${typeString}} from "./${filename}";`;
}

// Read file
async function parseAleo(programFolder: string, programName: string) {
  try {
    // Check if build directory exists
    if (!fs.existsSync(programFolder + 'build')) return;

    const inputFile = programFolder + 'build/main.aleo';

    console.log(`Parsing program[${programName}, ${inputFile}]`);

    const data = fs.readFileSync(inputFile, 'utf-8');
    const tokenizer = new Tokenizer(data);
    const aleoReflection = new Parser(tokenizer).parse();

    if (aleoReflection.customTypes.length === 0) {
      console.warn(
        `No types generated for program: ${programName}. No custom types[struct/record] declaration found`
      );
      return;
    }

    // Create Output Directory
    const outputFolder = GENERATE_FILE_OUT_DIR;
    if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

    const generator = new Generator(aleoReflection);

    const outputFile = `${programName}.ts`;

    const typeCode = generator.generateTypes();
    const js2leoCode = generator.generateTSToLeo();
    const leo2jsCode = generator.generateLeoToTS();

    await Promise.all([
      writeToFile(`${outputFolder}types/${outputFile}`, typeCode),
      writeToFile(`${outputFolder}leo2js/${outputFile}`, leo2jsCode),
      writeToFile(`${outputFolder}js2leo/${outputFile}`, js2leoCode)
    ]);

    const indexFileTypeImport = generateImportForIndexFile(
      generator.generatedTypes,
      programName
    );

    return {
      typeImport: indexFileTypeImport,
      types: generator.generatedTypes.join(', ')
    };
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

    const result = await Promise.all(
      folders.map((program) =>
        parseAleo(PROGRAM_DIRECTORY + program + '/', program)
      )
    );

    // Create types/index.ts file
    let typesIndexFileData = result
      .map((res: any) => res?.typeImport)
      .join('\n');

    typesIndexFileData = typesIndexFileData.concat(
      `\n\nexport {${result.map((res) => res?.types).join(', ')}}`
    );
    await writeToFile(
      GENERATE_FILE_OUT_DIR + 'types/index.ts',
      typesIndexFileData
    );
  } catch (error) {
    console.log(error);
  }
}

export { compilePrograms };
