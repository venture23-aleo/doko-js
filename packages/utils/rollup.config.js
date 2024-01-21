import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist',
    format: 'esm',
    entryFileNames: '[name].js'
  },
  plugins: [
    typescript({declaration: true, outDir: "dist"}),
    terser({
      format: {
        comments: 'some',
        beautify: true,
        ecma: '2022'
      },
      compress: false,
      mangle: false,
      module: true
    })
  ]
};
