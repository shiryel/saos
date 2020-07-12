import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
const pkg = require('./package.json');

export default {
	input: 'src/Saos.svelte',
	output: [
    { file: pkg.module, 'format': 'es' },
    { file: pkg.main, 'format': 'umd', name: 'Tags' }
  ],
	plugins: [
    svelte({dev: false}),
		resolve(),
    terser()
	]
};
