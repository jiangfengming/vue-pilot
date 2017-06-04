export default {
  functional: true,

  props: {
    tag: {
      type: String,
      default: 'a'
    },

    to: {
      type: [String, Object]
    },

    replace: {
      type: Boolean,
      default: false
    }
  },

  render(h, { props, children }) {
    return h(
      props.tag,
      {
        on: {
          click(e) {
            e.preventDefault()
            this.$router[props.replace ? 'replace' : 'push'](props.to)
          }
        }
      },
      children)
  }
}
