const RouterView = {
  data: {
    layout: null
  },

  props: {
    name: {
      type: String,
      default: 'default'
    }
  },

  created() {
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
  },

  render(h) {
    return h(this.layout, this.$vnode.data)
  }
}

export default RouterView
