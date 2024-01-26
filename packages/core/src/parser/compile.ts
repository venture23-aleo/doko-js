import fs from 'fs';
import path from 'path';

import { Tokenizer } from './tokenizer';
import { AleoReflection, Parser } from '@/parser/parser';

import { Generator } from '@/generator/generator';
import {
  getFilenamesInDirectory,
  getProjectRoot,
  pathFromRoot,
  writeToFile
} from '@aleojs/utils';
import {
  PROGRAM_DIRECTORY,
  GENERATE_FILE_OUT_DIR
} from '@/generator/string-constants';
import { FormatCode } from '@/utils/js-formatter';
import { GlobalIndexFileGenerator } from '@/generator/global-index-file-generator';

// Global Variables
const ImportFileCaches = new Map<string, AleoReflection>();
const GlobalIndexGenerator = new GlobalIndexFileGenerator();

function convertEnvToKeyVal(envData: string): Map<string, string> {
  envData = envData.trim();
  const envVariables = envData.split('\n');
  return new Map<string, string>(
    envVariables.map((variable) => {
      const keyVal = variable.split('=');
      if (keyVal.length !== 2)
        throw new Error('Invalid Environment declaration: ' + keyVal);
      return [keyVal[0], keyVal[1]];
    })
  );
}

async function generateReflection(filename: string) {
  // Check if build directory exists
  const data = fs.readFileSync(filename, 'utf-8');
  const tokenizer = new Tokenizer(data);
  return new Parser(tokenizer).parse();
}

async function generateTypesFile(
  outputFolder: string,
  outputFile: string,
  generator: Generator
) {
  return Promise.all([
    writeToFile(
      `${outputFolder}types/${outputFile}`,
      FormatCode(generator.generateTypes())
    ),
    writeToFile(
      `${outputFolder}leo2js/${outputFile}`,
      FormatCode(generator.generateLeoToJS())
    ),
    writeToFile(
      `${outputFolder}js2leo/${outputFile}`,
      FormatCode(generator.generateJSToLeo())
    )
  ]);
}
/*
async function parseAleoImport(
  importFolder: string,
  filename: string
): Promise<[string, ImportFileCache]> {
  const fileCache = ImportFileCaches.get(filename);
  if (fileCache) return [filename, fileCache];

  const aleoReflection = await generateReflection(importFolder + filename);
  if (aleoReflection.customTypes.length === 0) {
    console.warn(
      `No types generated for import file: ${filename}. No custom types[struct/record] declaration found`
    );
  } else {
    const outputFile = `${aleoReflection.programName}.ts`;
    const outputFolder = pathFromRoot(GENERATE_FILE_OUT_DIR);
    const generator = new Generator(aleoReflection);
    await generateTypesFile(outputFolder, outputFile, generator);

    GlobalIndexGenerator.update(generator, aleoReflection.programName);
  }

  const cache: ImportFileCache = {
    customTypes: aleoReflection.customTypes,
    mapping: aleoReflection.mappings
  };
  ImportFileCaches.set(filename, cache);
  return [filename, cache];
}
*/
// Read file
async function parseAleo(
  programFolder: string,
  imports: Map<string, AleoReflection> | null
): Promise<AleoReflection> {
  try {
    const inputFile = programFolder + 'build/main.aleo';

    const aleoReflection = await generateReflection(inputFile);
    if (imports) aleoReflection.imports = imports;

    // Parse .env for private key
    const envFile = programFolder + '/.env';
    const envData = fs.readFileSync(envFile, 'utf-8');
    aleoReflection.env = convertEnvToKeyVal(envData);

    // Create Output Directory
    const outputFolder = pathFromRoot(GENERATE_FILE_OUT_DIR);
    if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

    const programName = aleoReflection.programName;
    const outputFile = `${programName}.ts`;

    const generator = new Generator(aleoReflection);
    if (aleoReflection.customTypes.length === 0) {
      console.warn(
        `No types generated for program: ${programName}. No custom types[struct/record] declaration found`
      );
    } else await generateTypesFile(outputFolder, outputFile, generator);

    if (aleoReflection.functions.length > 0) {
      await writeToFile(
        `${outputFolder}${outputFile}`,
        FormatCode(generator.generateContractClass())
      );
    }

    // Update cache
    const originalFilename = `${programName}.aleo`;
    ImportFileCaches.set(originalFilename, aleoReflection);

    GlobalIndexGenerator.update(generator, programName);
    return aleoReflection;
  } catch (error) {
    throw error;
  }
}

async function resolveImportDependencies(importFolder: string) {
  const importFiles = getFilenamesInDirectory(importFolder);

  const filesToParse = importFiles.filter(
    (filename) => !ImportFileCaches.has(filename)
  );
  console.log('Unresolved import dependencies: ', filesToParse.join(', '));

  const importCachesPromise = filesToParse.map(async (filename: string) => {
    // @TODO nested import??
    const projectRoot = getProjectRoot();
    const programPath = path.join(
      projectRoot,
      PROGRAM_DIRECTORY,
      filename.split('.aleo')[0],
      '/'
    );
    await parseAleo(programPath, null);
  });

  await Promise.all(importCachesPromise);

  // Build imports
  const imports = new Map<string, AleoReflection>();
  importFiles.forEach((filename) => {
    imports.set(filename, ImportFileCaches.get(filename)!);
  });
  return imports;
}

async function parseProgram(programFolder: string) {
  // Check if build directory exists
  try {
    if (!fs.existsSync(programFolder + 'build')) return;
    console.log('Parsing program: ', programFolder);
    const importFolder = programFolder + 'build/imports/';
    let imports = null;
    if (fs.existsSync(importFolder)) {
      console.log('Resolving import dependencies ...');
      imports = await resolveImportDependencies(importFolder);
    }
    return parseAleo(programFolder, imports);
  } catch (err) {
    console.log(err);
  }
}

async function compilePrograms(projectRoot?: string) {
  try {
    if (!projectRoot) projectRoot = getProjectRoot();
    const programPath = path.join(projectRoot, PROGRAM_DIRECTORY);
    const outputPath = path.join(projectRoot, GENERATE_FILE_OUT_DIR);

    const contents = fs.readdirSync(programPath);
    const folders = contents.filter((name) =>
      fs.statSync(programPath + name).isDirectory()
    );

    // Create Output Directory
    if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

    for (const program of folders) {
      const originalName = `${program}.aleo`;
      if (ImportFileCaches.has(originalName))
        continue;

      await parseProgram(programPath + program + '/');
    }

    await GlobalIndexGenerator.generate(outputPath);
  } catch (error) {
    console.log(error);
  }
}

export { compilePrograms };
