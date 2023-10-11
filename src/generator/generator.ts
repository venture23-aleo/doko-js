/**
 * Generate the following files
 * 1. Type files  : JS/Leo Interface for all the custom types declared in the aleo
 * 2. JS2Leo File : Conversion from JS Object to Leo suitable object
 * 3. Leo2JS File : Conversion from Leo Object to JS Object
 */

import { AleoReflection } from "../parser/parser";

import * as fs from 'fs';
import { ConvertToJSType, StructDefinition } from "../utils/aleo-utils";
import { TSInterfaceGenerator } from "./ts-interface-generator";
import { ZodObjectGenerator } from "./zod-object-generator";
import { TSFunctionGenerator } from "./ts-function-generator";

const SCHEMA_IMPORT = `import { z } from "zod";
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
} from "./leo-types";`
const CONVERTER_FN_IMPORT = 'import { u8, u16, u32, u128, u64, field, scalar, group, boolean, address } from "./leo-types"'

class Generator {
    private refl: AleoReflection;
    private typeFilename = 'types.ts';
    private jsToLeoFilename = 'js2leo.ts';

    constructor(aleoReflection: AleoReflection) {
        this.refl = aleoReflection;
    }

    setTypeFileName(filename: string) {
        this.typeFilename = filename;
        return this;
    }

    setJSToLeoFilename(filename: string) {
        this.jsToLeoFilename = filename;
        return this;
    }

    private inferDataType(type: string): string {
        // Check if it is a custom type
        if (this.refl.isCustomType(type))
            return type;

        // Check if it is a primitive type
        const jsType = ConvertToJSType(type);
        if (jsType) return jsType;
        else throw new Error(`Undeclared type encountered: ${type}`);
    }

    private async generateTypes(rootDir: string) {
        const outputFile = rootDir + this.typeFilename;

        const tsFileStream = fs.createWriteStream(
            outputFile,
            'utf-8'
        );
        tsFileStream.write(SCHEMA_IMPORT + '\n\n');

        this.refl.customTypes.forEach((customType: StructDefinition) => {
            // Create Typescript/ Zod interface for custom types
            const tsInterfaceGenerator = new TSInterfaceGenerator();
            const zodInterfaceGenerator = new ZodObjectGenerator();
            const Capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

            customType.members.forEach((member) => {
                // Strip any scope qualifier (private, public)
                const type = member.val.split('.')[0];
                tsInterfaceGenerator.addField(
                    member.key,
                    this.inferDataType(type)
                );
                zodInterfaceGenerator.addField(member.key, `leo${Capitalize(type)}Schema`);
            });

            // Write type definition
            tsFileStream.write(tsInterfaceGenerator.generate(customType.name) + '\n\n');
            tsFileStream.write(zodInterfaceGenerator.generate(`leo${customType.name}Schema`) + '\n');

            // Generate type alias
            tsFileStream.write(`export type ${customType.name}Leo = z.infer<typeof leo${customType.name}Schema>` + '\n\n');
        });

        tsFileStream.close();
        return new Promise((resolve, reject) => {
            console.log(`Generated types file: ${outputFile}`);
            tsFileStream.on('error', reject);
            tsFileStream.on('close', resolve);
        });
    }

    private async generateJSToLeo(rootDir: string) {
        const js2LeoFileStream = fs.createWriteStream(
            rootDir + this.jsToLeoFilename, 'utf-8'
        );

        // Create import statement for custom types
        let importStatement = 'import {\n';
        importStatement += this.refl.customTypes.map((member) => `\t${member.name}, ${member.name}Leo,`).join('\n');
        importStatement = importStatement.concat('\n} from "./types"\n',
            CONVERTER_FN_IMPORT, '\n\n');
        js2LeoFileStream.write(importStatement);

        this.refl.customTypes.forEach((customType: StructDefinition) => {
            const fnGenerator = new TSFunctionGenerator();
            const leoTypeName = customType.name + 'Leo';
            const CamelCase = (str: string) => str.charAt(0).toLowerCase() + str.slice(1);
            const arg0 = CamelCase(customType.name);

            fnGenerator.addStatement(`\tconst result: ${leoTypeName} = {\n`)

            customType.members.forEach((member) => {
                const type = member.val.split('.');
                let conversionFnName = this.refl.isCustomType(type[0]) ? `get${type[0]}Leo` : type[0];
                const conversionArg = arg0.concat('.', member.key);
                fnGenerator.addStatement(`\t\t${member.key}: ${conversionFnName}(${conversionArg}),\n`);
            });

            fnGenerator.addStatement('\t}\n\treturn result;\n');

            const jsTypeName = customType.name;
            const fnName = 'get' + leoTypeName;
            js2LeoFileStream.write(fnGenerator.generate(fnName, arg0, jsTypeName, leoTypeName));
        });

        return new Promise((resolve, reject) => {
            console.log('Generated conversion file:', rootDir + this.jsToLeoFilename);
            js2LeoFileStream.on('error', reject);
            js2LeoFileStream.on('close', resolve);
        });
    }

    async generate(rootDir: string) {
        return Promise.all([
            this.generateTypes(rootDir),
            this.generateJSToLeo(rootDir)]);
    }
};

export { Generator }