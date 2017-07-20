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

  render(h, { parent, props, children, listeners, data }) {
    return h(
      props.tag,

      {
        ...data,

        attrs: {
          href: parent.$router.url(props.to)
        },

        on: {
          ...listeners,

          click(e) {
            e.preventDefault()
            parent.$router[props.method](props.to)

            if (listeners.click) listeners.click(e)
          }
        }
      },

      children
    )
  }
}
