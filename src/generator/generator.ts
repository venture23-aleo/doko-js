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
  generatedLeo2JSFn: string[] = [];
  generatedJS2LeoFn: string[] = [];

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

  private createLeoSchemaName(customTypeName: string) {
    return `leo${capitalize(customTypeName)}Schema`;
  }

  private createLeoSchemaAlias(leoSchemaAlias: string, customType: string) {
    return (
      `export type ${leoSchemaAlias} = z.infer<typeof leo${customType}Schema>` +
      '\n\n'
    );
  }

  private createImportStatement() {
    // Create import statement for custom types
    let importStatement = 'import {\n';
    importStatement += this.refl.customTypes
      .map((member) => `\t${member.name}, ${member.name}Leo,`)
      .join('\n');

    // Concat Import statement for converter function
    importStatement = importStatement.concat(
      '\n} from "../types"\n',
      LEO_FN_IMPORT,
      '\n\n'
    );
    return importStatement;
  }

  // Generate code for types file
  public generateTypes() {
    // Import primitive schema type for Leo (leo-types.ts)
    let code = SCHEMA_IMPORT + '\n\n';

    this.refl.customTypes.forEach((customType: StructDefinition) => {
      // Create Typescript/ Zod interface for custom types
      const tsInterfaceGenerator = new TSInterfaceGenerator();
      const zodInterfaceGenerator = new ZodObjectGenerator();

      customType.members.forEach((member) => {
        // Strip any scope qualifier (private, public)
        const dataType = member.val.split('.')[0];
        tsInterfaceGenerator.addField(member.key, this.inferDataType(dataType));
        zodInterfaceGenerator.addField(
          member.key,
          this.createLeoSchemaName(dataType)
        );
      });

      // Write type definition for JS
      code = code.concat(
        tsInterfaceGenerator.generate(customType.name),
        '\n\n'
      );

      // Write type definition for Leo/ ZodObject
      const leoSchemaName = this.createLeoSchemaName(customType.name);
      code = code.concat(zodInterfaceGenerator.generate(leoSchemaName), '\n');

      // Generate type alias
      const leoSchemaAlias = `${customType.name}Leo`;
      code = code.concat(
        this.createLeoSchemaAlias(leoSchemaAlias, customType.name)
      );

      // Cache the customType for later to use it in types/index.ts file
      this.generatedTypes.push(customType.name, leoSchemaName, leoSchemaAlias);
    });

    return code;
  }

  private generateConverterFunction(
    customType: StructDefinition,
    conversionTo: 'js' | 'leo'
  ) {
    const jsType = customType.name;
    const leoType = jsType + 'Leo';

    const argName = toCamelCase(customType.name);

    // if we are converting to js then the argType must be LEO and return type must be JS
    const argType = conversionTo == 'js' ? leoType : jsType;
    const returnType = conversionTo == 'js' ? jsType : leoType;

    const fnGenerator = new TSFunctionGenerator();

    // Add declaration statement
    fnGenerator.addStatement(`\tconst result: ${returnType} = {\n`);

    // Convert each of the member of the customType
    customType.members.forEach((member) => {
      // Split qualifier private/public
      const type = member.val.split('.');

      // Determine member conversion function
      let conversionFnName = '';
      if (this.refl.isCustomType(type[0]))
        conversionFnName =
          conversionTo == 'js' ? `get${type[0]}` : `get${type[0]}Leo`;
      else conversionFnName = type[0];

      // Add conversion statement
      fnGenerator.addStatement(
        `\t\t${member.key}: ${conversionFnName}(${argName}.${member.key}),\n`
      );
    });

    // Add return statement
    fnGenerator.addStatement('\t}\n\treturn result;\n');

    const fnName = 'get' + returnType;
    let code = fnGenerator.generate(fnName, argName, argType, returnType);

    // Cache function name for import/export in js2leo or leo2js index.ts file
    if (conversionTo == 'js') this.generatedLeo2JSFn.push(fnName);
    else this.generatedJS2LeoFn.push(fnName);

    return code;
  }

  // Generate TS to Leo converter functions
  public generateJSToLeo() {
    let code = this.createImportStatement();

    this.refl.customTypes.forEach((customType: StructDefinition) => {
      code = code.concat(this.generateConverterFunction(customType, 'leo'));
    });
    return code;
  }

  // Generate Leo to TS converter functions
  public generateLeoToJS() {
    // Create import statement for custom types
    let code = this.createImportStatement();
    this.refl.customTypes.forEach((customType: StructDefinition) => {
      code = code.concat(this.generateConverterFunction(customType, 'js'));
    });
    return code;
  }
}

export { Generator };
