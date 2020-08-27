import babel from '@rollup/plugin-babel'

export default {
  input: 'src/index.mjs',

  plugins: [
    babel({
      babelHelpers: 'bundled'
    })
  ],

  output: {
    format: 'esm',
    file: 'dist/vue-pilot.mjs'
  },

  external: ['spa-history', 'url-router', 'cast-string']
}
