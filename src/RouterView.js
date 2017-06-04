export default {
  props: {
    name: {
      type: String,
      default: 'default'
    }
  },

  render(h, { props, children, parent, data }) {
    if (this.$options.beforeRouteLeave) {
      this.$root.$route._leaveHooks.push(this.$options.beforeRouteLeave.bind(this))
    }

    let parent = this.$parent

    while (parent) {
      if (parent.constructor.extendOptions) {
        this.layout = parent.layout.children[this.name]
        break
      } else if (parent.$parent) {
        parent = parent.$parent
      } else {
        this.layout = this.$root.$route.layout[this.name]
      }
    }

    return h(this.layout, this.$vnode.data)
  }
}
