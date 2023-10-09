class ZodObjectGenerator {

    code = '';

    addField(member: string, type: string) {
        this.code = this.code.concat(`  ${member}: ${type}, \n`);
        return this;
    }

    generate(name: string) {
        return `export const ${name} = z.object({\n` + this.code + '})';
    }
}

export { ZodObjectGenerator };
