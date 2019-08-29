import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.mjs',

  plugins: [
    resolve(),
    babel()
  ],

  output: {
    format: 'esm',
    file: 'dist/vue-pilot.mjs'
  },

  external: ['spa-history', 'url-router']
}
