// setup.js
// const { buildPrograms } = require('../cli/dist');

module.exports = async () => {
  const buildPrograms = import('../cli/dist/index').buildPrograms;
  const compilePrograms = import('../core/dist').compilePrograms;
  console.log("I'll be called first before any test cases run");
  console.log('Compiling DokoJS project...');
  console.log(buildPrograms);
  // Add your compilation logic here
  await buildPrograms();
  // For ts files
  await compilePrograms();
};
