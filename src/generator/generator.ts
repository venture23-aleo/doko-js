/**
 * Generate the following files
 * 1. Type files  : JS/Leo Interface for all the custom types declared in the aleo
 * 2. JS2Leo File : Conversion from JS Object to Leo suitable object
 * 3. Leo2JS File : Conversion from Leo Object to JS Object
 */

import { AleoReflection } from '../parser/parser';
import { ConvertToTSType, StructDefinition } from '../utils/aleo-utils';
import { TSInterfaceGenerator } from './ts-interface-generator';
import { ZodObjectGenerator } from './zod-object-generator';
import { TSFunctionGenerator } from './ts-function-generator';
import { SCHEMA_IMPORT, LEO_FN_IMPORT, TS_FN_IMPORT } from './string-constants';
import { toCamelCase, capitalize } from '../utils/formatters';

class Generator {
  private refl: AleoReflection;

  generatedTypes: string[] = [];
  generatedTypeConverterFn: string[] = [];

  constructor(aleoReflection: AleoReflection) {
    this.refl = aleoReflection;
  }

  private inferDataType(type: string): string {
    // Check if it is a custom type
    if (this.refl.isCustomType(type)) return type;

    // Check if it is a primitive type
    const tsType = ConvertToTSType(type);
    if (tsType) return tsType;
    else throw new Error(`Undeclared type encountered: ${type}`);
  }

  // Create LeoSchemaName for customType
  private createLeoSchemaName(customTypeName: string) {
    return `leo${customTypeName}Schema`;
  }

  public generateTypes() {
    let code = SCHEMA_IMPORT + '\n\n';
    this.refl.customTypes.forEach((customType: StructDefinition) => {
      // Create Typescript/ Zod interface for custom types
      const tsInterfaceGenerator = new TSInterfaceGenerator();
      const zodInterfaceGenerator = new ZodObjectGenerator();

      customType.members.forEach((member) => {
        // Strip any scope qualifier (private, public)
        const type = member.val.split('.')[0];
        tsInterfaceGenerator.addField(member.key, this.inferDataType(type));
        zodInterfaceGenerator.addField(
          member.key,
          `leo${capitalize(type)}Schema`
        );
      });

      // Write type definition
      code = code.concat(
        tsInterfaceGenerator.generate(customType.name) + '\n\n'
      );

      const leoSchemaName = this.createLeoSchemaName(customType.name);
      code = code.concat(zodInterfaceGenerator.generate(leoSchemaName) + '\n');

      // Generate type alias
      const leoSchemaAlias = `${customType.name}Leo`;
      code = code.concat(
        `export type ${leoSchemaAlias}  = z.infer<typeof leo${customType.name}Schema>` +
          '\n\n'
      );

      this.generatedTypes.push(customType.name, leoSchemaName, leoSchemaAlias);
    });

    return code;
  }

  // Generate TS to Leo converter functions
  public generateTSToLeo() {
    // Create import statement for custom types
    let importStatement = 'import {\n';
    importStatement += this.refl.customTypes
      .map((member) => `\t${member.name}, ${member.name}Leo,`)
      .join('\n');
    importStatement = importStatement.concat(
      '\n} from "../types"\n',
      LEO_FN_IMPORT,
      '\n\n'
    );
    let code = importStatement;

    this.refl.customTypes.forEach((customType: StructDefinition) => {
      const fnGenerator = new TSFunctionGenerator();
      const leoTypeName = customType.name + 'Leo';
      const arg0 = toCamelCase(customType.name);

      fnGenerator.addStatement(`\tconst result: ${leoTypeName} = {\n`);

      customType.members.forEach((member) => {
        const type = member.val.split('.');
        let conversionFnName = this.refl.isCustomType(type[0])
          ? `get${type[0]}Leo`
          : type[0];
        const conversionArg = arg0.concat('.', member.key);
        fnGenerator.addStatement(
          `\t\t${member.key}: ${conversionFnName}(${conversionArg}),\n`
        );
      });

      fnGenerator.addStatement('\t}\n\treturn result;\n');

      const jsTypeName = customType.name;
      const fnName = 'get' + leoTypeName;
      code = code.concat(
        fnGenerator.generate(fnName, arg0, jsTypeName, leoTypeName)
      );
    });
    return code;
  }

  // Generate Leo to TS converter functions
  public generateLeoToTS() {
    // Create import statement for custom types
    let importStatement = 'import {\n';
    importStatement += this.refl.customTypes
      .map((member) => `\t${member.name}, ${member.name}Leo,`)
      .join('\n');
    importStatement = importStatement.concat(
      '\n} from "../types"\n',
      TS_FN_IMPORT,
      '\n\n'
    );

    let code = importStatement;
    this.refl.customTypes.forEach((customType: StructDefinition) => {
      const fnGenerator = new TSFunctionGenerator();
      const tsTypeName = customType.name;
      const arg0 = toCamelCase(customType.name);

      fnGenerator.addStatement(`\tconst result: ${tsTypeName} = {\n`);

      customType.members.forEach((member) => {
        const type = member.val.split('.');
        let conversionFnName = this.refl.isCustomType(type[0])
          ? `get${type[0]}`
          : type[0];
        const conversionArg = arg0.concat('.', member.key);
        fnGenerator.addStatement(
          `\t\t${member.key}: ${conversionFnName}(${conversionArg}),\n`
        );
      });

      fnGenerator.addStatement('\t}\n\treturn result;\n');

      const fnName = 'get' + tsTypeName;
      const leoTypeName = tsTypeName + 'Leo';
      code = code.concat(
        fnGenerator.generate(fnName, arg0, leoTypeName, tsTypeName)
      );
      this.generatedTypeConverterFn.push(fnName);
    });
    return code;
  }
}

export { Generator };
