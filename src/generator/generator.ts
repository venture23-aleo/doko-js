/**
 * Generate the following files
 * 1. Type files  : JS/Leo Interface for all the custom types declared in the aleo
 * 2. JS2Leo File : Conversion from JS Object to Leo suitable object
 * 3. Leo2JS File : Conversion from Leo Object to JS Object
 */

import { AleoReflection } from "../parser/parser";

import * as fs from 'fs';
import { ConvertToTSType, StructDefinition } from "../utils/aleo-utils";
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

// Converter function for leo and ts
const LEO_FN_IMPORT = 'import { u8, u16, u32, u128, u64, i8, i16, i32, i64, i128, field, scalar, group, boolean, address } from "./leo-types"'
const TS_FN_IMPORT = 'import { u8, u16, u32, u128, u64, i8, i16, i32, i64, i128, field, scalar, group, boolean, address } from "./ts-types"'

class Generator {
    private refl: AleoReflection;
    private typeFilename = 'types.ts';
    private tsToLeoFilename = 'js2leo.ts';
    private leoToTSFileName = 'ts2leo.ts';

    constructor(aleoReflection: AleoReflection) {
        this.refl = aleoReflection;
    }

    setTypeFileName(filename: string) {
        this.typeFilename = filename;
        return this;
    }

    setTSToLeoFilename(filename: string) {
        this.tsToLeoFilename = filename;
        return this;
    }

    setLeoToTSFilename(filename: string) {
        this.leoToTSFileName = filename;
        return this;
    }

    private inferDataType(type: string): string {
        // Check if it is a custom type
        if (this.refl.isCustomType(type))
            return type;

        // Check if it is a primitive type
        const tsType = ConvertToTSType(type);
        if (tsType) return tsType;
        else throw new Error(`Undeclared type encountered: ${type}`);
    }

    private async generateTypes(rootDir: string) {
        const outputFile = rootDir + this.typeFilename;

        const fileStream = fs.createWriteStream(
            outputFile,
            'utf-8'
        );
        fileStream.write(SCHEMA_IMPORT + '\n\n');

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
            fileStream.write(tsInterfaceGenerator.generate(customType.name) + '\n\n');
            fileStream.write(zodInterfaceGenerator.generate(`leo${customType.name}Schema`) + '\n');

            // Generate type alias
            fileStream.write(`export type ${customType.name}Leo = z.infer<typeof leo${customType.name}Schema>` + '\n\n');
        });

        fileStream.close();
        return new Promise((resolve, reject) => {
            console.log(`Generated types file: ${outputFile}`);
            fileStream.on('error', reject);
            fileStream.on('close', resolve);
        });
    }

    // Generate TS to Leo converter functions
    private async generateTSToLeo(rootDir: string) {
        const fileStream = fs.createWriteStream(
            rootDir + this.tsToLeoFilename, 'utf-8'
        );

        // Create import statement for custom types
        let importStatement = 'import {\n';
        importStatement += this.refl.customTypes.map((member) => `\t${member.name}, ${member.name}Leo,`).join('\n');
        importStatement = importStatement.concat('\n} from "./types"\n',
            LEO_FN_IMPORT, '\n\n');
        fileStream.write(importStatement);

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
            fileStream.write(fnGenerator.generate(fnName, arg0, jsTypeName, leoTypeName));
        });

        fileStream.close();
        return new Promise((resolve, reject) => {
            console.log('Generated conversion file:', rootDir + this.tsToLeoFilename);
            fileStream.on('error', reject);
            fileStream.on('close', resolve);
        });
    }

    // Generate Leo to TS converter functions
    private async generateLeoToTS(rootDir: string) {
        const fileStream = fs.createWriteStream(
            rootDir + this.leoToTSFileName, 'utf-8'
        );

        // Create import statement for custom types
        let importStatement = 'import {\n';
        importStatement += this.refl.customTypes.map((member) => `\t${member.name}, ${member.name}Leo,`).join('\n');
        importStatement = importStatement.concat('\n} from "./types"\n',
            TS_FN_IMPORT, '\n\n');
        fileStream.write(importStatement);

        this.refl.customTypes.forEach((customType: StructDefinition) => {
            const fnGenerator = new TSFunctionGenerator();
            const tsTypeName = customType.name;
            const CamelCase = (str: string) => str.charAt(0).toLowerCase() + str.slice(1);
            const arg0 = CamelCase(customType.name);

            fnGenerator.addStatement(`\tconst result: ${tsTypeName} = {\n`)

            customType.members.forEach((member) => {
                const type = member.val.split('.');
                let conversionFnName = this.refl.isCustomType(type[0]) ? `get${type[0]}` : type[0];
                const conversionArg = arg0.concat('.', member.key);
                fnGenerator.addStatement(`\t\t${member.key}: ${conversionFnName}(${conversionArg}),\n`);
            });

            fnGenerator.addStatement('\t}\n\treturn result;\n');

            const fnName = 'get' + tsTypeName;
            const leoTypeName = tsTypeName + 'Leo';
            fileStream.write(fnGenerator.generate(fnName, arg0, leoTypeName, tsTypeName));
        });

        fileStream.close();
        return new Promise((resolve, reject) => {
            console.log('Generated conversion file:', rootDir + this.leoToTSFileName);
            fileStream.on('error', reject);
            fileStream.on('close', resolve);
        });
    }

    async generate(rootDir: string) {
        if (this.refl.customTypes.length === 0) return;

        return Promise.all([
            this.generateTypes(rootDir),
            this.generateTSToLeo(rootDir),
            this.generateLeoToTS(rootDir)
        ]);
    }
};

export { Generator }