import path from 'path';

import { Generator } from '@/generator/generator';
import { writeToFile } from '@/utils/fs-utils';
import { FormatCode } from '@/utils/js-formatter';

class GlobalIndexFileGenerator {
  private types = '';
  private leo2js = '';
  private js2leo = '';

  private exportedTypes = '';
  private exportedJS2LeoFn = '';
  private exportedLeo2JSFn = '';

  private createImportStatement(importTypes: string, importFile: string) {
    return `import {${importTypes}} from './${importFile}';\n`;
  }

  private createExportStatement(importTypes: string) {
    return `export {${importTypes}};`;
  }

  update(generator: Generator, filename: string) {
    if (generator.generatedTypes.length > 0) {
      const types = generator.generatedTypes.join(', ');
      this.types = this.types.concat(
        this.createImportStatement(types, filename)
      );
      this.exportedTypes = this.exportedTypes.concat(types, ', ');
    }

    if (generator.generatedLeo2JSFn.length > 0) {
      const leo2jsFn = generator.generatedLeo2JSFn.join(', ');
      this.leo2js = this.leo2js.concat(
        this.createImportStatement(leo2jsFn, filename)
      );
      this.exportedLeo2JSFn = this.exportedLeo2JSFn.concat(leo2jsFn, ', ');
    }

    if (generator.generatedJS2LeoFn.length > 0) {
      const js2leoFn = generator.generatedJS2LeoFn.join(', ');
      this.js2leo = this.js2leo.concat(
        this.createImportStatement(js2leoFn, filename)
      );
      this.exportedJS2LeoFn = this.exportedJS2LeoFn.concat(js2leoFn, ', ');
    }
  }

  async generate(outputPath: string) {
    this.types = this.types.concat(
      '\n',
      this.createExportStatement(this.exportedTypes)
    );
    this.js2leo = this.js2leo.concat(
      '\n',
      this.createExportStatement(this.exportedJS2LeoFn)
    );
    this.leo2js = this.leo2js.concat(
      '\n',
      this.createExportStatement(this.exportedLeo2JSFn)
    );

    await Promise.all([
      writeToFile(
        path.join(outputPath, 'types/index.ts'),
        FormatCode(this.types)
      ),
      writeToFile(
        path.join(outputPath, 'leo2js/index.ts'),
        FormatCode(this.leo2js)
      ),
      writeToFile(
        path.join(outputPath, 'js2leo/index.ts'),
        FormatCode(this.js2leo)
      )
    ]);
  }
}

export { GlobalIndexFileGenerator };
