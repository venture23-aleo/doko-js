function toSnakeCase(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, '');
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function tabify(str: string): string {
  return str
    .split('\n')
    .map((str) => '\t' + str)
    .join('\n');
}

export { toSnakeCase, capitalize, toCamelCase, tabify };
