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
    file: 'dist/vueStatefulRouter.mjs'
  },

  external: ['spa-history', 'url-router']
}
