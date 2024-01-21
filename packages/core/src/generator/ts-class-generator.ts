import { KeyVal } from '@/utils/aleo-utils';
import { tabify } from '@aleojs/utils';

export class TSClassGenerator {
  methods: string[] = [];
  members: KeyVal<string, string>[] = [];

  addMethod(method: string): void {
    this.methods.push(method);
  }

  addMember(member: KeyVal<string, string>) {
    this.members.push(member);
  }

  generate(className: string) {
    const memberDeclaration = this.members
      .map((member) => `${member.key}: ${member.val};\n`)
      .join('');

    const methodDeclaration = this.methods.join('');

    return (
      `export class ${className} {\n` +
      `\n${tabify(memberDeclaration)}` +
      `\n${tabify(methodDeclaration)}\n` +
      '}'
    );
  }
}
