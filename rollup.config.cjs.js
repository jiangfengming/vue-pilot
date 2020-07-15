import babel from '@rollup/plugin-babel'

export default {
  input: 'src/index.mjs',

  plugins: [
    babel()
  ],

  output: {
    format: 'cjs',
    file: 'dist/vue-pilot.js'
  },

  external: ['spa-history', 'url-router', 'cast-string']
}
