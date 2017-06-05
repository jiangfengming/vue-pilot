export default {
  functional: true,

  props: {
    name: {
      type: String,
      default: 'default'
    }
  },

  render(h, { props, children, parent, data }) {
    while (parent) {
      if (parent.$vnode && parent.$vnode.data._routerView) {
        data._routerView = parent.$vnode.data._routerView.children[props.name]
        break
      } else if (parent.$parent) {
        parent = parent.$parent
      } else if (parent.$route) {
        data._routerView = parent.$root.$route._layout[props.name]
        break
      } else {
        return h()
      }
    }

    return h(data._routerView.component, Object.assign(data, { props: data._routerView.props }), children)
  }
}
