import base from './rollup.config.base'

export default {
  ...base,
  output: {
    format: 'umd',
    name: 'vueStatefulRouter',
    file: 'dist/vueStatefulRouter.umd.js'
  }
}
