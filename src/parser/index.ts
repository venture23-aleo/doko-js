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

// Generate Import/Export code for index file from definitions and filename
// definition has an item which can be function or types
function generateIndexFileCode(
  declaredItems: { items?: string; filename?: string }[]
): string {
  // Create individual import statement according to type/function definition and filename
  let code = declaredItems
    .map(
      (declaredItem) =>
        `import { ${declaredItem.items} } from "./${declaredItem.filename}";\n`
    )
    .join('');

  // Create a single line export statement from all the declared type/functions
  const exportItems = declaredItems.map((item) => item?.items).join(', ');
  return code.concat(`\nexport { ${exportItems} }`);
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

    await Promise.all([
      writeToFile(
        `${outputFolder}types/${outputFile}`,
        generator.generateTypes()
      ),
      writeToFile(
        `${outputFolder}leo2js/${outputFile}`,
        generator.generateLeoToJS()
      ),
      writeToFile(
        `${outputFolder}js2leo/${outputFile}`,
        generator.generateJSToLeo()
      )
    ]);

    return {
      types: generator.generatedTypes,
      js2LeoFn: generator.generatedJS2LeoFn,
      leo2jsFn: generator.generatedLeo2JSFn,
      programName
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

    // Create import for types/index.ts file
    let typesIndexFileData = generateIndexFileCode(
      result.map((elm) => {
        return {
          items: elm?.types.join(', '),
          filename: elm?.programName
        };
      })
    );

    // Create import for leo2ts/index.ts file
    let leo2jsIndexFileData = generateIndexFileCode(
      result.map((elm) => {
        return {
          items: elm?.leo2jsFn.join(', '),
          filename: elm?.programName
        };
      })
    );

    // Create import for js2leo/index.ts file
    let js2leoIndexFileData = generateIndexFileCode(
      result.map((elm) => {
        return {
          items: elm?.js2LeoFn.join(', '),
          filename: elm?.programName
        };
      })
    );

    await Promise.all([
      writeToFile(GENERATE_FILE_OUT_DIR + 'types/index.ts', typesIndexFileData),
      writeToFile(
        GENERATE_FILE_OUT_DIR + 'leo2js/index.ts',
        leo2jsIndexFileData
      ),
      writeToFile(
        GENERATE_FILE_OUT_DIR + 'js2leo/index.ts',
        js2leoIndexFileData
      )
    ]);
  } catch (error) {
    console.log(error);
  }
}

export { compilePrograms };
