// Import necessary modules
import { AleoReflection, Parser } from '@/parser/parser';
import { Generator } from '@/generator/generator';
import { FormatCode } from '@/utils/js-formatter';
import { Tokenizer } from './tokenizer';

// Utility to extract imports from program code
const getFileImports = (code: string) => {
  const regex = /import\s+([\w.]+);/g;
  const matches = [];
  let match;
  while ((match = regex.exec(code)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

// Interface for input program and imports
interface ProgramInput {
  type: 'program' | 'import';
  name?: string;
  content: string;
}

interface GeneratedCode {
    programName: string;
    types: string;
    leoToJS: string;
    jsToLeo: string;
    contractClass: string;
    transitions: string;
  }

async function parseAleoOpCode(data: string): Promise<GeneratedCode> {
    const tokenizer = new Tokenizer(data);
    const aleoReflection = new Parser(tokenizer).parse();
  
    const programName = aleoReflection.programName;
  
    const generator = new Generator(aleoReflection, {
      isImportedAleo: false
    });
    let generatedTypes = '',
      generatedLeoToJS = '',
      generatedJSToLeo = '';
    if (aleoReflection.customTypes.length === 0) {
      console.warn(
        `No types generated for program: ${programName}. No custom types[struct/record] declaration found`
      );
    } else {
      generatedTypes = FormatCode(generator.generateTypes());
      generatedLeoToJS = FormatCode(generator.generateLeoToJS());
      generatedJSToLeo = FormatCode(generator.generateJSToLeo());
    }
  
    let generatedContractClass = '',
      generatedTransitions = '';
    if (aleoReflection.functions.length > 0) {
      generatedContractClass = FormatCode(generator.generateContractClass());
  
      generatedTransitions = FormatCode(generator.generateTransitions());
    }
  
    return {
      programName: aleoReflection.programName,
      types: generatedTypes,
      leoToJS: generatedLeoToJS,
      jsToLeo: generatedJSToLeo,
      contractClass: generatedContractClass,
      transitions: generatedTransitions
    };
  }

async function parseAndGenerate(programs: ProgramInput[]): Promise<GeneratedCode[]> {
  const generatedPrograms: GeneratedCode[] = [];

  for (const program of programs) {
    if (program.type === 'program') {
      const { name, content } = program;
      if (!name) throw new Error('Program name is missing.');

      // Parse the main program
      const tokenizer = new Tokenizer(content);
      const aleoReflection = new Parser(tokenizer).parse();

      // Generate TypeScript code for the main program
      const generator = new Generator(aleoReflection, {
        isImportedAleo: false
      });
      const generatedCode: GeneratedCode = {
        programName: name,
        types: generator.generateTypes(),
        leoToJS: generator.generateLeoToJS(),
        jsToLeo: generator.generateJsToLeo(),
        contractClass: generator.generateContractClass(),
      };
      generatedPrograms.push(generatedCode);

      // Handle Imports
      const imports = getFileImports(content);
      for (const importName of imports) {
        const importContent = programs.find(
          (imp) => imp.type === 'import' && imp.name === importName
        )?.content;

        if (importContent) {
          // Parse and generate for the import
          const importTokenizer = new Tokenizer(importContent);
          const importParser = new Parser(importTokenizer);
          const importAst = importParser.parse();
          const importReflection = new AleoReflection(importAst);

          const importGenerator = new Generator(importReflection);
          generatedPrograms.push({
            programName: importName,
            types: importGenerator.generateTypes(),
            leoToJS: importGenerator.generateLeoToJS(),
            jsToLeo: importGenerator.generateJsToLeo(),
            contractClass: importGenerator.generateContractClass(),
          });
        } else {
          console.warn(`Import ${importName} not found in provided imports.`);
        }
      }
    }
  }
  return generatedPrograms;
}

const check = () => {console.log("Success"); return {}}

export { parseAndGenerate, check };
