import { KeyVal } from '../utils/aleo-utils';
import { tabify } from '@aleojs/utils';

export default class TSClassGenerator {
  methods: string[] = [];
  members: KeyVal<string, string>[] = [];
  inheritedClasses: string[] = [];

  addMethod(method: string) {
    this.methods.push(method);
    return this;
  }

  extendsFrom(className: string) {
    this.inheritedClasses.push(className);
    return this;
  }

  addMember(member: KeyVal<string, string>) {
    this.members.push(member);
    return this;
  }

  generate(className: string) {
    const memberDeclaration = this.members
      .map((member) => `${member.key}: ${member.val};\n`)
      .join('');

    const methodDeclaration = this.methods.join('');

    const inheritStatement = this.inheritedClasses.length > 0 ? `extends ${this.inheritedClasses.join()}` : ''
    return (
      `export class ${className} ${inheritStatement} {` +
      `\n${tabify(memberDeclaration)}` +
      `\n${tabify(methodDeclaration)}\n` +
      '}'
    );
  }
}
