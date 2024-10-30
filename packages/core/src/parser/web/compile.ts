import { AleoReflection, Parser } from '@/parser/parser';
import { Generator } from '@/generator/generator';
import { FormatCode } from '@/utils/js-formatter';

import { Tokenizer } from '../tokenizer';
import { sortProgramsByImports } from './utils';

interface GeneratedCode {
    programName: string;
    types: string;
    leo2js: string;
    js2leo: string;
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
        leo2js: generatedLeoToJS,
        js2leo: generatedJSToLeo,
        contractClass: generatedContractClass,
        transitions: generatedTransitions
    };
}

async function bulkParseProgram(data: string[]) {
    const sortedPrograms = sortProgramsByImports(data);

    if (!(sortedPrograms instanceof Error)) {
        const generatedData = await Promise.all(sortedPrograms.map(async (program) => await parseAleoOpCode(program)));

        return generatedData;
    }
}

export { parseAleoOpCode, bulkParseProgram };
