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
    function click(e) {
      if (!e.defaultPrevented && props.to) {
        e.preventDefault()
        parent.$router[props.method](props.to)
      }
    }

    return h(
      props.tag,

      {
        ...data,

        attrs: {
          ...data.attrs,
          href: props.to ? parent.$router.url(props.to) : 'javascript:'
        },

        on: {
          ...listeners,
          click: listeners.click ? [].concat(listeners.click, click) : click
        }
      },

      children
    )
  }
}
