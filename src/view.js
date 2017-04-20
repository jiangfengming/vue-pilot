export default {
  functional: true,

  props: {
    name: {
      type: String,
      default: 'default'
    }
  },

  render(h, { props, children, parent, data }) {
    let parentRoute

    while (parent) {
      if (parent.$vnode && parent.$vnode.routerView) {
        parentRoute = parent
        break
      } else if (parent.$parent) {
        parent = parent.$parent
      } else {
        parentRoute = parent.$route
        break
      }
    }
  }
}
