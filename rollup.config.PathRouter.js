import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  entry: 'src/PathRouter.js',
  plugins: [
    resolve(),
    commonjs(),
    babel({ exclude: 'node_modules/**' })
  ],
  format: 'umd',
  moduleName: 'PathRouter',
  dest: 'PathRouter.js'
}
