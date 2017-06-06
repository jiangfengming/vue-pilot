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
        data._routerView = parent.$route._layout[props.name]
        break
      } else {
        return h()
      }
    }

    if (data._routerView.props) {
      const viewProps = data._routerView.props.constructor === Function ? data._routerView.props(parent.$root.$route) : data._routerView.props
      Object.assign(data, { props: viewProps })
    }

    return h(data._routerView.component, data, children)
  }
}
