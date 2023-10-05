class TSInterfaceGenerator {
  code = '';
  addField(member: string, type: string) {
    this.code = this.code.concat(`  ${member}: ${type}; \n`);
    return this;
  }

  generate(name: string) {
    return `interface ${name} {\n` + this.code + '}';
  }
}

export { TSInterfaceGenerator };
