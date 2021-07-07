import resolve from '@rollup/plugin-node-resolve';
import pkg from "../package.json";

export default {
  input: 'src/main.js',
  plugins: [
    resolve(),
  ],
  output: {
    file: pkg.main,
    //sourcemap: 'inline',
    format: 'esm',
    name: pkg.name
  }
};
