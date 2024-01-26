import jsBeautify from 'js-beautify';
const { js_beautify } = jsBeautify;

const formatterOptions = {
  indent_size: 2
};

// Helpers
export const FormatCode = (code: string) => {
  return js_beautify(code, formatterOptions);
};
