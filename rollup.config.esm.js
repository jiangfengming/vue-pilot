import base from './rollup.config.base'

export default {
  ...base,
  output: {
    format: 'es',
    file: 'dist/vueStatefulRouter.esm.js'
  }
}
