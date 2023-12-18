import * as jsbeautifier from 'js-beautify';

const formatterOptions = {
  indent_size: 2
};

// Helpers
export const FormatCode = (code: string) => {
  return jsbeautifier.js_beautify(code, formatterOptions);
};
