import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.mjs',

  plugins: [
    resolve(),
    babel()
  ],

  output: {
    format: 'cjs',
    file: 'dist/vue-pilot.js'
  },

  external: ['spa-history', 'url-router', 'cast-string']
}
