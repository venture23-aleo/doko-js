import { GetProgramTransitionsTypeName } from './leo-naming';

export type OutputArg =
  | 'public'
  | 'private'
  | 'external_record'
  | 'future'
  | { recordType: string };

class TSReceiptTypeGenerator {
  code = '';

  private mapOutput(output: OutputArg) {
    const outputType = typeof output === 'object' ? 'record' : output;
    const recordTypeName = typeof output === 'object' ? output.recordType : '';
    switch (outputType) {
      case 'public':
        return 'tx.PublicOutput';
      case 'private':
        return 'tx.PrivateOutput';
      case 'external_record':
        return 'tx.ExternalRecordOutput';
      case 'future':
        return 'tx.FutureOutput';
      case 'record':
        return `tx.RecordOutput<${recordTypeName}>`;
    }
  }

  addTransition(
    program: string,
    functionName: string,
    outputs: Array<OutputArg>
  ) {
    this.code = this.code.concat('tx.Transition<[ ');

    this.code = this.code.concat(
      outputs.map((output) => this.mapOutput(output)).join(', ')
    );

    this.code = this.code.concat(`], '${program}', '${functionName}'>, \n`);
    return this;
  }

  addTransitionRef(program: string, functionName: string, prefix?: string) {
    const referencedTransitionName = GetProgramTransitionsTypeName(
      program,
      functionName
    );
    this.code = this.code.concat(
      `...${prefix || ''}${referencedTransitionName}['execution']['transitions'], \n`
    );
  }

  generate(name: string) {
    return `export type ${name} = tx.ExecutionReceipt<[${this.code}]>`;
  }
}

export { TSReceiptTypeGenerator };
