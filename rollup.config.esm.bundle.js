import babel from '@rollup/plugin-babel'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'src/index.mjs',

  plugins: [
    resolve(),

    babel({
      babelHelpers: 'bundled'
    })
  ],

  output: {
    format: 'esm',
    file: 'dist/vue-pilot.bundle.mjs'
  }
}
