module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["import", "@typescript-eslint", "prettier"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "prettier",
  ],
  env: {
    node: true,
  },
  rules: {
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/explicit-module-boundary-types": 0,
    "@typescript-eslint/no-unused-vars": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
    "comma-dangle": 0,
    semi: 0,
    "object-curly-newline": 0,
    "no-prototype-builtins": 0,
    "no-plusplus": 0,
    "no-underscore-dangle": 0,
    "use-isnan": "off",
    "no-restricted-globals": ["off", "isNaN"],
    "implicit-arrow-linebreak": [0, "below"],
    quotes: [2, "single", "avoid-escape"],
    "object-curly-spacing": ["error", "always"],
    "keyword-spacing": "off",
    "@typescript-eslint/keyword-spacing": [
      "error",
      {
        before: true,
        after: true,
      },
    ],
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
  },
  globals: {
    __base: true,
    global: true,
    isNaN: true,
  },
};
