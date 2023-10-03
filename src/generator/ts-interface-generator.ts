import { StructDefinition } from "../utils/aleo-utils";

class TSInterfaceGenerator {
  static generate(definition: StructDefinition) {
    let code = "";
    definition.members.forEach((member) => {
      code = code.concat(`  ${member.key}: ${member.val}; \n`);
    });
    return `interface ${definition.name} {\n` + code + "}";
  }
}

export { TSInterfaceGenerator };
