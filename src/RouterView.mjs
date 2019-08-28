export default {
  functional: true,

  props: {
    name: {
      type: String,
      default: 'default'
    }
  },

  render(h, { props, children, parent, data }) {
    const route = parent.$root.$route

    if (!route || !route._layout) {
      return
    }

    let routerView
    let _parent = parent

    while (_parent) {
      // root vm's $vnode is undefined
      if (_parent.$vnode && _parent.$vnode.data._routerView) {
        const children = _parent.$vnode.data._routerView.children
        routerView = children && children[props.name]
        break
      } else if (_parent.$parent) {
        _parent = _parent.$parent
      } else {
        routerView = route._layout[props.name]
        break
      }
    }

    if (!routerView || !routerView.component) {
      return
    }

    if (routerView.props) {
      const viewProps = routerView.props instanceof Function
        ? routerView.props(route)
        : routerView.props

      Object.assign(data, { props: viewProps })
    }

    data._routerView = routerView
    return h(routerView.component, data, children)
  }
}
