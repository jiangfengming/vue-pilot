export default {
  functional: true,

  props: {
    tag: {
      default: 'a'
    },

    to: {
      type: [String, Object]
    },

    method: {
      type: String,
      default: 'push' // push, replace, dispatch
    }
  },

  render(h, { parent, props, children, data }) {
    return h(
      props.tag,
      Object.assign(data, {
        attrs: {
          href: parent.$router.url(props.to)
        },

        on: {
          click(e) {
            e.preventDefault()
            parent.$router[props.method](props.to)
          }
        }
      }),
      children
    )
  }
}
