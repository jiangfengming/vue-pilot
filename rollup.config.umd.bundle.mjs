import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.mjs',
  plugins: [
    resolve(),
    babel({
      exclude: 'node_modules/**'
    })
  ],
  output: {
    format: 'umd',
    name: 'vueStatefulRouter',
    file: 'dist/vueStatefulRouter.bundle.js'
  }
}
