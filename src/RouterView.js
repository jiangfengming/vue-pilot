export default {
  functional: true,

  props: {
    name: {
      type: String,
      default: 'default'
    }
  },

  render(h, { props, children, parent, data }) {
    if (!parent.$root.$route.path) return

    while (parent) {
      if (parent.$vnode && parent.$vnode.data._routerView) {
        if (parent.$vnode.data._routerView.children && parent.$vnode.data._routerView.children[props.name]) {
          data._routerView = parent.$vnode.data._routerView.children[props.name]
          break
        } else {
          return
        }
      } else if (parent.$parent) {
        parent = parent.$parent
      } else {
        data._routerView = parent.$route._layout[props.name]
        break
      }
    }

    if (data._routerView.component) {
      if (data._routerView.props) {
        const viewProps = data._routerView.props.constructor === Function ? data._routerView.props(parent.$root.$route) : data._routerView.props
        Object.assign(data, { props: viewProps })
      }

      return h(data._routerView.component, data, children)
    }
  }
}
