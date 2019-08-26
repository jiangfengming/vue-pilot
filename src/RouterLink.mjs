export default {
  functional: true,

  props: {
    tag: {
      default: 'a'
    },

    to: {
      type: [String, Object]
    },

    action: {
      type: String,
      default: 'push' // push, replace, dispatch
    }
  },

  render(h, { parent, props, children, listeners, data }) {
    function click(e) {
      if (!e.defaultPrevented && props.to) {
        e.preventDefault()
        parent.$router[props.action](props.to)
      }
    }

    data.attrs.href = props.to ? parent.$router.url(props.to) : 'javascript:'
    listeners.click = listeners.click ? [].concat(listeners.click, click) : click
    return h(props.tag, data, children)
  }
}
