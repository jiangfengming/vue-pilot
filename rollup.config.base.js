import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: 'src/index.js',
  plugins: [
    resolve(),
    babel({
      babelrc: false,
      presets: [
        [
          'env',
          {
            loose: true,
            modules: false
          }
        ],
        'stage-3'
      ],
      plugins: [
        'external-helpers'
      ]
    })
  ]
}
